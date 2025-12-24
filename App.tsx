import React, { useState } from 'react';
import Scene from './components/Scene';
import { TreeState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.CHAOS);

  const toggleState = () => {
    setTreeState((prev) => 
      prev === TreeState.CHAOS ? TreeState.FORMED : TreeState.CHAOS
    );
  };

  return (
    <div className="w-full h-screen relative">
      <Scene treeState={treeState} />
      
      {/* HUD / UI Layer */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-8 md:p-12">
        
        {/* Header */}
        <header className="flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl md:text-6xl text-luxury-gold font-bold tracking-widest uppercase drop-shadow-[0_0_10px_rgba(212,175,55,0.8)]">
            The Grand Holiday
          </h1>
          <div className="w-24 h-1 bg-luxury-gold mt-4 mb-2 shadow-[0_0_10px_#FFD700]"></div>
          <p className="text-luxury-goldLight text-sm md:text-base tracking-[0.2em] uppercase opacity-80">
            A Luxury Interactive Experience
          </p>
        </header>

        {/* Controls */}
        <div className="pointer-events-auto flex flex-col items-center gap-4 mb-8">
           <button
            onClick={toggleState}
            className={`
              relative overflow-hidden group
              px-12 py-4 
              border-2 border-luxury-gold 
              bg-luxury-emeraldDark/80 backdrop-blur-md
              text-luxury-gold font-bold text-lg tracking-widest uppercase
              transition-all duration-500 ease-out
              hover:bg-luxury-gold hover:text-luxury-emeraldDark
              hover:shadow-[0_0_30px_#FFD700]
            `}
          >
            <span className="relative z-10">
              {treeState === TreeState.CHAOS ? 'ASSEMBLE' : 'DISPERSE'}
            </span>
            {/* Shine effect */}
            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:left-[100%] transition-all duration-700 ease-in-out"></div>
          </button>
          
          <p className="text-luxury-goldLight/60 text-xs tracking-widest mt-2">
            STATUS: <span className="text-white font-bold">{treeState}</span>
          </p>
        </div>
      </div>

      {/* Decorative Borders */}
      <div className="pointer-events-none absolute top-4 left-4 w-64 h-64 border-t-2 border-l-2 border-luxury-gold/30 rounded-tl-3xl"></div>
      <div className="pointer-events-none absolute top-4 right-4 w-64 h-64 border-t-2 border-r-2 border-luxury-gold/30 rounded-tr-3xl"></div>
      <div className="pointer-events-none absolute bottom-4 left-4 w-64 h-64 border-b-2 border-l-2 border-luxury-gold/30 rounded-bl-3xl"></div>
      <div className="pointer-events-none absolute bottom-4 right-4 w-64 h-64 border-b-2 border-r-2 border-luxury-gold/30 rounded-br-3xl"></div>
    </div>
  );
};

export default App;