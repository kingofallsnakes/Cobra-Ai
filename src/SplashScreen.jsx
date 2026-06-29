import React, { useEffect, useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSatelliteDish } from '@fortawesome/free-solid-svg-icons';

const SplashScreen = ({ onStart }) => {
  const [loadingText, setLoadingText] = useState('ESTABLISHING SECURE UPLINK');
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const sequences = [
      'ACQUIRING SATELLITE LOCK',
      'BYPASSING FIREWALLS',
      'INITIALIZING TACTICAL HOLOGRAPHY',
      'UPLINK CONNECTED'
    ];
    
    let currentSeq = 0;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + Math.floor(Math.random() * 20) + 5;
      });
    }, 400);

    const textInterval = setInterval(() => {
      if (currentSeq < sequences.length) {
        setLoadingText(sequences[currentSeq]);
        currentSeq++;
      } else {
        setIsReady(true);
        clearInterval(textInterval);
      }
    }, 800);

    return () => {
      clearInterval(interval);
      clearInterval(textInterval);
    };
  }, []);

  // Generate randomized warp stars once
  const warpStars = useMemo(() => {
    const stars = [];
    for (let i = 0; i < 40; i++) {
      stars.push({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 3}s`,
        duration: `${Math.random() * 2 + 2}s`
      });
    }
    return stars;
  }, []);

  return (
    <div className="relative h-screen w-screen bg-[#000005] flex flex-col justify-center items-center overflow-hidden font-sans">
      
      {/* Warp Speed Starfield Background */}
      <div className="absolute inset-0 z-0 overflow-hidden preserve-3d">
         {warpStars.map(star => (
           <div 
             key={star.id} 
             className="warp-star"
             style={{
               top: star.top,
               left: star.left,
               animationDelay: star.delay,
               animationDuration: star.duration
             }}
           ></div>
         ))}
      </div>
      
      {/* Radial vignette for depth focus */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_#000005_95%)] z-0 pointer-events-none"></div>

      {/* Main Layout Wrapper: FIXED MOBILE RESPONSIVENESS */}
      <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center preserve-3d">
        
        {/* The Glass Card */}
        <div className="w-full bg-[#050510]/40 backdrop-blur-3xl border border-cyan-500/20 rounded-[2rem] p-10 shadow-[0_30px_80px_rgba(0,255,255,0.1)] transform transition-transform duration-700 flex flex-col items-center relative overflow-hidden">

          {/* Holographic 3D Globe */}
          <div className="relative flex justify-center items-center mb-16 w-32 h-32 preserve-3d">
            
            {/* The 3D Rings */}
            <div className="absolute w-32 h-32 rounded-full border border-cyan-400/50 shadow-[0_0_15px_rgba(0,255,255,0.4)] globe-ring-1"></div>
            <div className="absolute w-32 h-32 rounded-full border border-fuchsia-400/40 shadow-[0_0_15px_rgba(217,70,239,0.3)] globe-ring-2"></div>
            <div className="absolute w-32 h-32 rounded-full border border-cyan-300/30 shadow-[0_0_10px_rgba(0,255,255,0.2)] globe-ring-3"></div>
            
            {/* Inner Core Singularity */}
            <div className="absolute w-8 h-8 bg-white rounded-full blur-[2px] shadow-[0_0_30px_#fff,0_0_60px_#0ff] animate-[pulse_1s_ease-in-out_infinite]"></div>
          </div>

          {/* Title */}
          <div className="text-center mb-10 w-full relative z-10">
            <h1 className="text-4xl font-extrabold tracking-[0.2em] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] mb-2">
              COBRA
            </h1>
            <p className="text-[10px] tracking-[0.4em] font-mono text-cyan-400/80 uppercase">
              Tactical Interface
            </p>
          </div>

          {/* Progress Interface */}
          <div className="w-full flex flex-col items-center mb-10 relative z-10">
            <div className="h-4 flex justify-between items-center w-full mb-3 px-1">
               <span className="text-[9px] font-mono text-fuchsia-500/70 tracking-widest uppercase">
                 STATUS
               </span>
               <span className="text-[9px] font-mono text-cyan-400 tracking-widest uppercase transition-opacity duration-300">
                 {loadingText}
               </span>
            </div>
            
            <div className="w-full h-1 bg-cyan-950 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.8)] transition-all duration-300 ease-out"
                style={{ width: `${progress >= 100 ? 100 : progress}%` }}
              ></div>
            </div>
          </div>

          {/* Unlock Button */}
          <button
            onClick={onStart}
            disabled={!isReady}
            className={`
              relative flex items-center justify-center gap-3 w-full py-4 rounded-full font-mono text-xs font-bold tracking-widest uppercase transition-all duration-500 overflow-hidden
              ${isReady 
                 ? 'bg-cyan-500/10 border border-cyan-400 text-cyan-300 hover:bg-cyan-500/20 hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] cursor-pointer' 
                 : 'bg-transparent border border-cyan-900/30 text-cyan-900/50 cursor-not-allowed'}
            `}
          >
             <FontAwesomeIcon icon={faSatelliteDish} className={isReady ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]' : ''} />
             {isReady ? 'ESTABLISH LINK' : 'SEEKING SIGNAL'}
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
