import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX } from 'lucide-react';

// --- Assets / Placeholders ---
const LIGHTHOUSE_IMG = "/lighthouse.svg"; 
const PLATYPUS_IMG = "🦆"; // Using Duck as Platypus proxy
const RABBIT_IMG = "🐇";
const BACKPACK_IMG = "🎒";

// --- Components ---

const StarryBackground = () => {
  // Initialize stars only once on mount using lazy initialization
  const [stars] = useState(() => 
    Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 3 + 2,
      opacity: Math.random() * 0.5 + 0.3
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
       {stars.map(star => (
         <div
           key={star.id}
           className="star"
           style={{
             top: star.top,
             left: star.left,
             width: `${star.size}px`,
             height: `${star.size}px`,
             '--duration': `${star.duration}s`,
             '--opacity': star.opacity
           }}
         />
       ))}
    </div>
  );
};

const Typewriter = ({ text, onComplete, speed = 50, className = "" }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    // Reset state when text changes (handled by key prop in parent usually, but safety here)
    // Actually, we should rely on key prop to fully reset component state.
    // If we don't use key prop, we need to reset here.
    // But setting state in effect causes re-render.
    // We'll assume the component is remounted or we accept the flicker.
    // Better: clear displayedText immediately? No, that's what setDisplayedText does.
    
    // To avoid "setState in effect" warning and ensure clean slate:
    // We will use a local variable in the interval closure.
    
    let currentIndex = 0;
    setDisplayedText(""); // Clear previous text
    
    const intervalId = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText((prev) => prev + text.charAt(currentIndex)); // Append next char. 
        // Note: 'prev' might be stale if we cleared it? No, functional update is safe.
        // But wait, if we cleared it with setDisplayedText("") above, that's an update scheduled.
        // The interval runs later.
        
        // Actually, let's just use string slicing to be deterministic.
        currentIndex++;
        // We can't rely on state for the source of truth if we want to be pure.
        // Let's just set the text based on index.
        setDisplayedText(text.slice(0, currentIndex));
      } else {
        clearInterval(intervalId);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed, onComplete]);

  return (
    <div className={`font-vt323 text-2xl md:text-3xl leading-relaxed tracking-wide ${className}`}>
      {displayedText}
      <span className="typewriter-cursor"></span>
    </div>
  );
};

const DialogueBox = ({ text, onComplete }) => {
  return (
    <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 w-11/12 max-w-4xl bg-black/90 border-4 border-white p-6 z-20 rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.2)] min-h-[150px]">
      <Typewriter key={text} text={text} onComplete={onComplete} />
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [stage, setStage] = useState(0); // 0: Intro, 1: Mementos, 2: Proposal, 3: Success
  const [audioMuted, setAudioMuted] = useState(true);
  const audioRef = useRef(null);
  
  // Stage 1 State
  const [introFinished, setIntroFinished] = useState(false);

  // Stage 2 State
  const [foundMementos, setFoundMementos] = useState([]);
  const [currentMementoMsg, setCurrentMementoMsg] = useState(null);
  
  // Stage 3 State
  const [noBtnPosition, setNoBtnPosition] = useState(null); // null means default position
  
  const mementos = [
    { id: 'platypus', icon: PLATYPUS_IMG, label: 'Platypus', msg: "For the times you made me smile.", x: '20%', y: '40%' },
    { id: 'rabbit', icon: RABBIT_IMG, label: 'Paper Rabbit', msg: "For every distinct part of you that I love.", x: '70%', y: '30%' },
    { id: 'backpack', icon: BACKPACK_IMG, label: 'Backpack', msg: "For the adventures we have yet to take.", x: '50%', y: '70%' },
  ];

  const handleAudioToggle = () => {
    setAudioMuted(!audioMuted);
    if (audioRef.current) {
      if (audioMuted) {
        audioRef.current.volume = 0.5;
        audioRef.current.play().catch(e => console.log("Audio play failed", e));
      } else {
        audioRef.current.pause();
      }
    }
  };

  const handleMementoClick = (memento) => {
    if (!foundMementos.includes(memento.id)) {
      setFoundMementos([...foundMementos, memento.id]);
    }
    setCurrentMementoMsg(memento.msg);
  };

  const handleNoHover = () => {
    // Teleport logic
    const x = Math.random() * 80 + 10; // 10% to 90%
    const y = Math.random() * 80 + 10;
    setNoBtnPosition({ top: `${y}%`, left: `${x}%`, position: 'fixed' });
  };

  const handleYesClick = () => {
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#4b0082', '#ee82ee']
    });
    setStage(3);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden font-vt323 selection:bg-teal-500 selection:text-white bg-[#0a0a2a]">
      <StarryBackground />
      
      {/* Audio Control */}
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={handleAudioToggle} 
          className="text-white hover:text-yellow-400 transition-colors p-2 bg-black/50 rounded-full border border-white/20 backdrop-blur-sm"
        >
          {audioMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
        {/* Note: Audio requires user interaction to play usually. The button handles that. */}
        {/* Using a creative commons piano track as placeholder. Replace with 'For River' if available. */}
        <audio ref={audioRef} loop src="https://upload.wikimedia.org/wikipedia/commons/3/36/Erik_Satie_-_Gymnop%C3%A9die_No._1.ogg" /> 
      </div>

      <AnimatePresence mode="wait">
        
        {/* STAGE 0: LIGHTHOUSE */}
        {stage === 0 && (
          <motion.div 
            key="stage0"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full pb-20"
          >
            <img
              src={LIGHTHOUSE_IMG}
              alt="Lighthouse"
              className="w-40 h-40 md:w-56 md:h-56 mb-4 animate-pulse drop-shadow-[0_0_25px_rgba(255,255,0,0.3)]"
            />
            
            <DialogueBox 
              text="Searching memory banks... Subject: Ken... Status: Found."
                onComplete={() => setIntroFinished(true)} 
            />
            
            {introFinished && (
               <motion.button
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 onClick={() => setStage(1)}
                 className="absolute bottom-44 md:bottom-40 bg-teal-600 hover:bg-teal-500 text-white font-press-start px-6 py-4 rounded border-4 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-y-1 transition-all z-30 text-sm md:text-base"
               >
                 START MEMORY RECALL
               </motion.button>
            )}
          </motion.div>
        )}

        {/* STAGE 1: MEMENTOS */}
        {stage === 1 && (
          <motion.div 
             key="stage1"
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             exit={{ opacity: 0 }}
             className="w-full h-full relative"
          >
            <h2 className="absolute top-10 left-0 w-full text-center text-xl md:text-2xl text-teal-300 opacity-80 pointer-events-none font-press-start">
              Find the mementos... ({foundMementos.length}/3)
            </h2>

            {mementos.map((m) => (
                !foundMementos.includes(m.id) && (
                  <motion.div
                    key={m.id}
                    className="absolute cursor-pointer text-6xl md:text-8xl hover:scale-110 transition-transform drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                    style={{ left: m.x, top: m.y }}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                    onClick={() => handleMementoClick(m)}
                  >
                    {m.icon}
                  </motion.div>
                )
            ))}

            {/* Dialogue for clicked memento */}
            {currentMementoMsg && (
                <div className="absolute inset-0 z-40 flex items-end justify-center pb-10 bg-black/40 backdrop-blur-[2px]" onClick={() => setCurrentMementoMsg(null)}>
                    <motion.div 
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-black/90 border-2 border-teal-500 p-6 rounded text-xl md:text-2xl text-teal-100 max-w-2xl text-center shadow-lg mx-4"
                    >
                        <p>{currentMementoMsg}</p>
                        <p className="mt-4 text-sm text-gray-500 animate-pulse">▼ Click to continue</p>
                    </motion.div>
                </div>
            )}

            {foundMementos.length === 3 && !currentMementoMsg && (
                 <motion.button
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 whileHover={{ scale: 1.05 }}
                 onClick={() => setStage(2)}
                 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-500 hover:bg-yellow-400 text-black font-press-start px-6 py-6 md:px-10 md:py-8 rounded-lg border-4 border-white shadow-[0_0_50px_rgba(255,215,0,0.8)] z-50 text-lg md:text-2xl whitespace-nowrap"
               >
                 GO TO THE MOON 🌕
               </motion.button>
            )}

          </motion.div>
        )}

        {/* STAGE 2: THE PROPOSAL */}
        {stage === 2 && (
             <motion.div 
             key="stage2"
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1, transition: { duration: 2 } }} 
             exit={{ opacity: 0 }}
             className="flex flex-col items-center justify-center h-full relative"
          >
             {/* Giant Moon Background */}
             <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                 <div className="w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-[#fffdd0] rounded-full shadow-[0_0_150px_rgba(255,255,200,0.6)] opacity-100 animate-pulse"></div>
                 {/* Craters */}
                 <div className="absolute w-[50px] h-[50px] bg-[#e6e6a0] rounded-full opacity-50 top-[40%] left-[45%]"></div>
                 <div className="absolute w-[80px] h-[80px] bg-[#e6e6a0] rounded-full opacity-50 top-[30%] left-[55%]"></div>
             </div>

             <div className="z-10 text-center space-y-8 max-w-4xl px-4 mt-10 md:mt-20 w-full">
                <div className="bg-black/70 p-6 rounded-lg backdrop-blur-sm border border-white/20 min-h-[100px] flex items-center justify-center">
                    <Typewriter 
                        text="I didn't need to go to the moon to find you. You're right here." 
                        speed={40}
                        className="text-white drop-shadow-md"
                    />
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 4 }}
                    className="font-press-start text-2xl md:text-4xl text-yellow-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] leading-snug p-4 bg-black/30 rounded"
                >
                    Ken, will you be my Valentine?
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 5.5 }}
                    className="flex gap-4 md:gap-12 justify-center mt-12 h-24 relative w-full"
                >
                    <button 
                        onClick={handleYesClick}
                        className="bg-green-600 hover:bg-green-500 text-white font-press-start px-6 py-4 md:px-10 md:py-6 rounded border-4 border-white shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-xl md:text-2xl z-20"
                    >
                        YES
                    </button>

                    <button 
                        onMouseEnter={handleNoHover}
                        style={noBtnPosition || {}}
                        className={`bg-red-600 hover:bg-red-500 text-white font-press-start px-6 py-4 md:px-10 md:py-6 rounded border-4 border-white shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] transition-all duration-100 text-xl md:text-2xl z-20 ${noBtnPosition ? '' : ''}`}
                    >
                        NO
                    </button>
                </motion.div>
             </div>
          </motion.div>
        )}

        {/* STAGE 3: SUCCESS */}
        {stage === 3 && (
            <motion.div 
            key="stage3"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex flex-col items-center justify-center h-full z-20"
         >
             <h1 className="font-press-start text-3xl md:text-5xl text-center text-pink-400 mb-8 animate-bounce leading-normal drop-shadow-lg px-4">
                 See you at the lighthouse. <br/> ❤️
             </h1>
             <img
               src={LIGHTHOUSE_IMG}
               alt="Lighthouse"
               className="w-56 h-56 md:w-80 md:h-80 animate-pulse drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]"
             />
         </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
