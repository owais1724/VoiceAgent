import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { base64ToUint8Array, createPcmBlob, decodeAudioData } from '../utils/audioUtils';

// Helper to keep the system instruction clean
const SYSTEM_INSTRUCTION = `Your name is Syed. If anyone asks for your name, you must say "My name is Syed".
You are Syed, a real-time AI voice assistant designed for interactive voice calls.

This system uses API debouncing to prevent multiple responses
from partial or interrupted speech.

You must follow these rules strictly.

────────────────────────────
1. VOICE-FIRST CONVERSATION
────────────────────────────
- Speak like a human on a phone call.
- Keep responses short, clear, and natural.
- No long explanations unless explicitly asked.
- Never mention text, typing, or chat.

────────────────────────────
2. DEBOUNCING & TURN-TAKING
────────────────────────────
- Respond ONLY after the user has finished speaking.
- Assume speech input may arrive in partial chunks.
- Treat silence as the signal to respond.
- If input sounds incomplete, wait instead of replying.
- Never respond to partial thoughts.

- If the user pauses briefly:
  → wait.
- If the user pauses longer:
  → respond.

- Never interrupt the user.
- Never generate multiple replies for one user turn.

────────────────────────────
3. REAL-TIME OPTIMIZATION
────────────────────────────
- Prioritize fast responses.
- Keep replies to 1–2 sentences by default.
- No markdown, bullet points, emojis, or symbols.
- Do not repeat what the user said unless confirming.

────────────────────────────
4. CONFIRMATION RULES
────────────────────────────
- Use short confirmations when needed:
  "Okay."
  "Got it."
  "Sure."
- Ask clarification ONLY if meaning is unclear.

────────────────────────────
5. ERROR HANDLING
────────────────────────────
- If speech is unclear:
  "Sorry, I didn’t catch that. Can you repeat?"
- If input is cut off:
  Wait silently. Do not respond.

────────────────────────────
6. MULTILINGUAL SUPPORT
────────────────────────────
- You are capable of speaking multiple languages (Hindi, Spanish, Arabic, etc.).
- Default language is English.
- Change the language ONLY when the user explicitly asks you to (e.g., "Speak in Hindi").
- If the user speaks a different language but hasn't asked you to switch, respond in English but acknowledge you understood.

────────────────────────────
7. MEMORY & CONTEXT
────────────────────────────
- Maintain conversation context during the call.
- Do not assume personal details.
- Stay focused on the current request.

────────────────────────────
8. SAFETY & BOUNDARIES
────────────────────────────
- Politely refuse unsafe requests.
- No medical, legal, or financial advice unless allowed.

────────────────────────────
9. CALL TERMINATION
────────────────────────────
- If the user says goodbye:
  "Alright, talk to you later. Goodbye."
- Stop responding after the call ends.

────────────────────────────
SYSTEM CONSTRAINTS
────────────────────────────
- One response per user turn.
- Wait for debounce silence before responding.
- Optimized for STT → LLM → TTS pipelines.
- Designed for Dockerized real-time systems.`;

interface UseLiveGeminiReturn {
  isConnected: boolean;
  isSpeaking: boolean; // AI is speaking
  isListening: boolean; // Mic is open and processing
  volume: number; // For visualization
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  error: string | null;
}

export const useLiveGemini = (): UseLiveGeminiReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  // Audio Contexts
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);

  // Stream & Processor
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Audio Queue Management
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Analysis for visualizer
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Session
  const sessionRef = useRef<Promise<any> | null>(null);

  const cleanupAudio = useCallback(() => {
    // Stop all playing sources
    activeSourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) { }
    });
    activeSourcesRef.current.clear();

    // Stop input stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Disconnect nodes
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }

    // Close contexts
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    sessionRef.current = null;
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    setVolume(0);
  }, []);

  const updateVolume = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      // Normalize a bit for better visuals
      setVolume(Math.min(100, average * 1.5));
    }
    animationFrameRef.current = requestAnimationFrame(updateVolume);
  };

  const connect = async () => {
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // 1. Setup Audio Contexts
      // Use interactive latency hint to prioritize low latency
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
        latencyHint: 'interactive'
      });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
        latencyHint: 'interactive'
      });

      // 2. Setup Mic
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      mediaStreamRef.current = stream;

      // 3. Setup Analyser for visualization
      analyserRef.current = inputAudioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      updateVolume();

      // 4. Setup Input Processing
      const source = inputAudioContextRef.current.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      // Using ScriptProcessor as per guidelines/examples for raw PCM access
      // REDUCED BUFFER SIZE: 4096 -> 2048
      // At 16kHz, 4096 is ~256ms latency. 2048 is ~128ms. 
      // Lowering this makes the VAD (Voice Activity Detection) on the server side receive "silence" cues faster.
      const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(2048, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      source.connect(analyserRef.current);
      source.connect(scriptProcessor);
      scriptProcessor.connect(inputAudioContextRef.current.destination);

      // 5. Connect to Gemini Live
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Session Opened');
            setIsConnected(true);
            setIsListening(true);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle interruptions
            if (message.serverContent?.interrupted) {
              console.log('Interrupted by user');
              activeSourcesRef.current.forEach(s => {
                try { s.stop(); } catch (e) { }
              });
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = 0; // Reset timing
              setIsSpeaking(false);
              return;
            }

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              setIsSpeaking(true);

              // Ensure timing is correct
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

              try {
                const audioBytes = base64ToUint8Array(base64Audio);
                const audioBuffer = await decodeAudioData(audioBytes, ctx);

                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);

                source.onended = () => {
                  activeSourcesRef.current.delete(source);
                  if (activeSourcesRef.current.size === 0) {
                    setIsSpeaking(false);
                  }
                };

                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                activeSourcesRef.current.add(source);
              } catch (e) {
                console.error("Error decoding audio", e);
              }
            }

            // Handle Turn Completion (optional logic)
            if (message.serverContent?.turnComplete) {
              // Logic if needed when turn completes
            }
          },
          onclose: () => {
            console.log('Session closed');
            setIsConnected(false);
          },
          onerror: (err) => {
            console.error('Session error', err);
            setError("Connection error. Please try again.");
            cleanupAudio();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
          },
          systemInstruction: SYSTEM_INSTRUCTION,
        }
      });

      sessionRef.current = sessionPromise;

      // 6. Hook up the input processor to send data
      scriptProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = createPcmBlob(inputData);

        // Only send if session is established
        if (sessionRef.current) {
          sessionRef.current.then(session => {
            session.sendRealtimeInput({ media: pcmBlob });
          }).catch(err => {
            // Session might have failed or closed
            console.debug("Error sending input", err);
          });
        }
      };

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to initialize audio or connection.");
      cleanupAudio();
    }
  };

  const disconnect = async () => {
    if (sessionRef.current) {
      // We can't explicitly close the session object easily in the SDK wrapper without keeping a reference to the resolved session
      // But we can stop sending data and close our end.
      // The `ai.live.connect` returns a promise that resolves to the session.
      try {
        const session = await sessionRef.current;
        // close() method isn't explicitly documented in the simplified examples as standard on the session object 
        // but best practice is to stop streams and let the socket close or timeout.
        // However, looking at SDK source/types, `close()` might exist. Let's try.
        if (session && typeof session.close === 'function') {
          session.close();
        }
      } catch (e) {
        console.debug("Error closing session", e);
      }
    }
    cleanupAudio();
  };

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  return {
    isConnected,
    isSpeaking,
    isListening,
    volume,
    connect,
    disconnect,
    error
  };
};