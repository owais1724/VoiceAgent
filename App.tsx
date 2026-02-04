import React from 'react';
import { useLiveGemini } from './hooks/useLiveGemini';
import Visualizer from './components/Visualizer';
import ControlPanel from './components/ControlPanel';

const App: React.FC = () => {
  const { isConnected, isSpeaking, volume, connect, disconnect, error } = useLiveGemini();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black overflow-hidden">
      
      {/* Header */}
      <header className="p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
           <h1 className="text-xl font-semibold tracking-wide text-gray-200">Syed</h1>
        </div>
        <div className="text-xs font-mono text-gray-500 border border-gray-800 px-2 py-1 rounded">
           {isConnected ? "SECURE CONNECTION" : "DISCONNECTED"}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative">
        
        {/* Error Message */}
        {error && (
          <div className="absolute top-10 bg-red-900/50 border border-red-500/50 text-red-200 px-6 py-3 rounded-lg backdrop-blur-sm animate-fade-in">
            {error}
          </div>
        )}

        {/* Visualizer Container */}
        <div className="relative z-0">
           <Visualizer volume={volume} isActive={isConnected} isSpeaking={isSpeaking} />
        </div>
        
        {/* Instructions/Hint */}
        {!isConnected && (
            <p className="mt-12 text-gray-500 max-w-md text-center leading-relaxed animate-pulse">
                Tap the button below to start a real-time voice conversation.
                <br />
                <span className="text-xs opacity-50">Headphones recommended for best experience.</span>
            </p>
        )}

      </main>

      {/* Footer Controls */}
      <footer className="p-10 flex justify-center pb-20 z-10">
        <ControlPanel 
            isConnected={isConnected} 
            onConnect={connect} 
            onDisconnect={disconnect} 
        />
      </footer>
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
         <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-900/10 blur-[120px]"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[120px]"></div>
      </div>
    </div>
  );
};

export default App;