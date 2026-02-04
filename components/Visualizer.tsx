import React from 'react';

interface VisualizerProps {
  volume: number; // 0-100
  isActive: boolean;
  isSpeaking: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ volume, isActive, isSpeaking }) => {
  const scale = isActive ? 1 + (volume / 50) : 1;
  
  // State-based styles
  let ringColor = "border-gray-700";
  let shadowClass = "";

  if (isSpeaking) {
    // Speaking: Cyan glow
    ringColor = "border-cyan-400";
    shadowClass = "shadow-[0_0_50px_rgba(34,211,238,0.6)]";
  } else if (isActive) {
    // Listening: Rose/Red glow based on volume
    if (volume > 10) {
       ringColor = "border-rose-500";
       shadowClass = "shadow-[0_0_50px_rgba(244,63,94,0.6)]";
    } else {
       ringColor = "border-white";
       shadowClass = "shadow-[0_0_30px_rgba(255,255,255,0.2)]";
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center w-80 h-80">
        {/* Outer Rings (Animations) */}
        {isActive && (
           <>
              <div className={`pulse-ring absolute w-64 h-64 border ${ringColor} opacity-40 rounded-full`} style={{ animationDelay: '0s' }}></div>
              <div className={`pulse-ring absolute w-64 h-64 border ${ringColor} opacity-40 rounded-full`} style={{ animationDelay: '0.4s' }}></div>
           </>
        )}

        {/* Core Image Container */}
        <div 
          className={`relative z-10 w-48 h-48 rounded-full overflow-hidden border-4 transition-all duration-150 ease-out ${ringColor} ${shadowClass} bg-[#111827]`}
          style={{ 
            transform: `scale(${isSpeaking ? 1.05 + Math.random() * 0.03 : scale})`, 
          }}
        >
            {/* Custom Avatar SVG with Float Animation */}
            {/* The animate-float class applies the gentle up/down bobbing defined in index.html */}
            <div className={`w-full h-full flex items-center justify-center ${isActive ? 'animate-float' : ''}`}>
                <svg viewBox="0 0 100 100" className="w-full h-full bg-[#1e293b] p-2">
                    {/* Background fill */}
                    <rect width="100" height="100" fill="#1e293b"/>
                    
                    {/* Head */}
                    <circle cx="50" cy="32" r="16" fill="#9ca3af" />
                    
                    {/* Body */}
                    <path d="M30 58 Q50 54 70 58 L72 100 L28 100 Z" fill="#9ca3af" />

                    {/* Left Arm (Viewer's Left) */}
                    <path d="M28 58 L20 85 L26 88" stroke="#9ca3af" strokeWidth="6" strokeLinecap="round" fill="none" />

                    {/* Right Arm (Viewer's Right - Holding case) */}
                    <path d="M72 58 L80 85 L74 88" stroke="#9ca3af" strokeWidth="6" strokeLinecap="round" fill="none" />

                    {/* Briefcase */}
                    <rect x="74" y="80" width="22" height="16" rx="2" fill="#3b82f6" />
                    <path d="M80 80 V 77 Q85 75 90 77 V 80" stroke="#3b82f6" strokeWidth="2" fill="none" />
                </svg>
            </div>
        </div>
      </div>
      
      {/* Name and Status */}
      <div className="text-center space-y-2 -mt-4 relative z-20">
         <h2 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">Syed</h2>
         <p className="text-sm font-medium tracking-[0.2em] uppercase text-cyan-500 h-6 drop-shadow-md">
           {isSpeaking ? "Speaking..." : isActive ? "Listening..." : "Offline"}
         </p>
      </div>
    </div>
  );
};

export default Visualizer;