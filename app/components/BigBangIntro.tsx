'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const StarfieldCanvas = dynamic(() => import('./StarfieldCanvas'), { ssr: false });
const ParticleExplosion = dynamic(() => import('./ParticleExplosion'), { ssr: false });

export default function BigBangIntro({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0);
  const [skipIntro, setSkipIntro] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cosmicSoundRef = useRef<HTMLAudioElement | null>(null);
  const bassDropRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Show skip button after a short delay
    const skipTimer = setTimeout(() => setShowSkipButton(true), 1500);
    
    // Load and set up audio
    if (!audioRef.current) {
      audioRef.current = new Audio('/heartbeat.mp3');
      audioRef.current.volume = 0.6;
      audioRef.current.loop = true;
    }
    
    if (!cosmicSoundRef.current) {
      cosmicSoundRef.current = new Audio('/cosmic-ambient.mp3'); // You'll need this audio file
      cosmicSoundRef.current.volume = 0.4;
    }
    
    if (!bassDropRef.current) {
      bassDropRef.current = new Audio('/bass-drop.mp3'); // You'll need this audio file
      bassDropRef.current.volume = 0.7;
    }
    
    // Play initial heartbeat
    audioRef.current?.play().catch(() => {});
    
    // Don't proceed if user skipped
    if (skipIntro) {
      audioRef.current?.pause();
      if (cosmicSoundRef.current) cosmicSoundRef.current.pause();
      if (bassDropRef.current) bassDropRef.current.pause();
      onComplete();
      return;
    }
    
    const timers = [
      // Initial black screen with ambient audio start
      setTimeout(() => {
        setStage(1);
        cosmicSoundRef.current?.play().catch(() => {});
      }, 1000),
      
      // Small particle burst
      setTimeout(() => setStage(2), 2500),
      
      // Heartbeat appears
      setTimeout(() => setStage(3), 3500),
      
      // Heartbeat animation starts
      setTimeout(() => setStage(4), 4500),
      
      // Big Bang explosion
      setTimeout(() => {
        setStage(5);
        audioRef.current?.pause();
        bassDropRef.current?.play().catch(() => {});
      }, 6000),
      
      // Stars form
      setTimeout(() => setStage(6), 7000),
      
      // Bitcoin symbol appears
      setTimeout(() => setStage(7), 8000),
      
      // Title appears
      setTimeout(() => setStage(8), 9000),
      
      // Final state and transition to main app
      setTimeout(() => {
        setStage(9);
        setTimeout(() => {
          onComplete();
        }, 1500);
      }, 10500),
    ];
    
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(skipTimer);
      audioRef.current?.pause();
      if (cosmicSoundRef.current) cosmicSoundRef.current.pause();
      if (bassDropRef.current) bassDropRef.current.pause();
    };
  }, [onComplete, skipIntro]);
  
  const handleSkip = () => {
    setSkipIntro(true);
  };
  
  if (skipIntro) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
      {/* Skip Button */}
      <AnimatePresence>
        {showSkipButton && stage < 9 && (
          <motion.button
            className="absolute top-4 right-6 px-4 py-1 text-xs bg-transparent border border-white/30 text-white/60 rounded-full hover:bg-white/10 z-50 transition-colors"
            onClick={handleSkip}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            Skip Intro
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Initial tiny dot of light */}
      {stage >= 1 && (
        <motion.div
          className="absolute w-1 h-1 bg-white rounded-full z-20"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: stage < 5 ? [0.3, 0.8, 0.3] : 0,
            scale: stage < 5 ? [1, 1.5, 1] : 20,
          }}
          transition={{ 
            duration: 3, 
            repeat: stage < 5 ? Infinity : 0,
            repeatType: "mirror"
          }}
        />
      )}
      
      {/* Small particle burst */}
      {stage >= 2 && stage < 5 && (
        <div className="absolute">
          <ParticleSmallBurst />
        </div>
      )}
      
      {/* Big Bang Explosion */}
      {stage >= 5 && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <ParticleExplosion />
        </div>
      )}
      
      {/* Starfield */}
      {stage >= 6 && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: stage >= 6 ? 1 : 0 }}
          transition={{ duration: 2 }}
        >
          <StarfieldCanvas volume={1} />
        </motion.div>
      )}
      
      {/* Bitcoin Symbol */}
      {stage >= 7 && (
        <motion.div
          className="absolute z-30"
          initial={{ opacity: 0, scale: 6, rotate: 0 }}
          animate={{ 
            opacity: stage === 9 ? 0 : 1, 
            scale: stage === 9 ? 0.5 : 1,
            rotate: 360
          }}
          transition={{ 
            opacity: { duration: 1 },
            scale: { duration: 1.5 },
            rotate: { duration: 20, repeat: Infinity, ease: "linear" }
          }}
        >
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill="#F7931A" />
            <path d="M50 10C27.909 10 10 27.909 10 50C10 72.091 27.909 90 50 90C72.091 90 90 72.091 90 50C90 27.909 72.091 10 50 10ZM50 85.455C30.465 85.455 14.545 69.535 14.545 50C14.545 30.465 30.465 14.545 50 14.545C69.535 14.545 85.455 30.465 85.455 50C85.455 69.535 69.535 85.455 50 85.455Z" fill="#FFFFFF" />
            <path d="M56.818 41.364H47.727V34.091H52.273V30.455H47.727V25H43.182V30.455H38.636V34.091H43.182V41.364H40.909V45H43.182V65.909H47.727V45H52.273V41.364H47.727V45H56.818C59.091 45 61.364 47.273 61.364 49.545C61.364 51.818 59.091 54.091 56.818 54.091H52.273V57.727H56.818C59.091 57.727 61.364 60 61.364 62.273C61.364 64.545 59.091 66.818 56.818 66.818H40.909V70.455H56.818C61.364 70.455 65 66.818 65 62.273C65 59.545 63.636 57.273 61.364 55.909C63.636 54.545 65 52.273 65 49.545C65 45 61.364 41.364 56.818 41.364Z" fill="#FFFFFF" />
          </svg>
        </motion.div>
      )}
      
      {/* Heart Element */}
      {(stage >= 3 && stage < 5) && (
        <motion.div
          className="absolute z-20"
          initial={{ opacity: 0, scale: 0.2 }}
          animate={{
            opacity: 1,
            scale: stage === 4 ? [0.8, 1.2, 0.9, 1.1, 1] : 0.8,
          }}
          exit={{ opacity: 0, scale: 5 }}
          transition={{
            duration: stage === 4 ? 2 : 1,
            ease: 'easeInOut',
            times: [0, 0.3, 0.6, 0.8, 1],
            repeat: stage === 4 ? Infinity : 0,
            repeatType: 'reverse',
          }}
        >
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" fill="#FF3A44" />
          </svg>
        </motion.div>
      )}
      
      {/* Title with animated text */}
      {stage >= 8 && (
        <motion.div
          className="absolute z-30 text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ 
            opacity: stage === 9 ? 0 : 1, 
            y: 0
          }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.h1
            className="text-6xl font-bold mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <GlowingText>Bitcoin Resonance</GlowingText>
          </motion.h1>
          <motion.p
            className="text-lg text-blue-200 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            Feel the pulse of the market
          </motion.p>
        </motion.div>
      )}
      
      {/* Fade out overlay */}
      {stage === 9 && (
        <motion.div
          className="absolute inset-0 bg-black z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
      )}
    </div>
  );
}

// Particle small burst component
function ParticleSmallBurst() {
  const particles = Array.from({ length: 20 });
  
  return (
    <>
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          initial={{ 
            x: 0, 
            y: 0,
            opacity: 1 
          }}
          animate={{ 
            x: Math.random() * 60 - 30,
            y: Math.random() * 60 - 30,
            opacity: 0
          }}
          transition={{ 
            duration: 1.5 + Math.random(),
            repeat: Infinity,
            delay: Math.random() * 2,
            repeatType: "loop"
          }}
        />
      ))}
    </>
  );
}

// Text with glow effect
function GlowingText({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block">
      <span className="absolute inset-0 blur-md text-blue-400 opacity-75">{children}</span>
      <span className="relative text-white">{children}</span>
    </span>
  );
}