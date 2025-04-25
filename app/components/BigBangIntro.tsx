'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const StarfieldCanvas = dynamic(() => import('./StarfieldCanvas'), { ssr: false });

export default function BigBangIntro({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/heartbeat.mp3');
      audioRef.current.volume = 0.6;
    }
    audioRef.current?.play().catch(() => {});

    const timers = [
      setTimeout(() => setStage(1), 1000), // 심장 등장
      setTimeout(() => setStage(2), 2500), // 심장 박동 애니메이션 시작
      setTimeout(() => setStage(3), 4000), // 타이틀 등장
      setTimeout(() => setStage(4), 5500), // 별 배경 fade-in
      setTimeout(() => {
        setStage(5); // intro 끝
        onComplete();
      }, 7000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
      {/* Starfield */}
      {stage >= 4 && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <StarfieldCanvas volume={1} />
        </motion.div>
      )}

      {/* Heart */}
      {stage >= 1 && (
        <motion.img
          src="/heart.svg"
          alt="Heart"
          className="w-24 h-24 z-10"
          initial={{ opacity: 0, scale: 0.2 }}
          animate={{
            opacity: 1,
            scale: stage === 2 ? [0.8, 1.2, 0.9, 1.1, 1] : 0.8,
          }}
          transition={{
            duration: stage === 2 ? 2 : 1,
            ease: 'easeInOut',
            times: [0, 0.3, 0.6, 0.8, 1],
            repeat: stage === 2 ? Infinity : 0,
            repeatType: 'reverse',
          }}
        />
      )}

      {/* Title */}
      {stage >= 3 && (
        <motion.h1
          className="absolute text-5xl font-bold text-white z-20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2 }}
        >
          Bitcoin Resonance
        </motion.h1>
      )}
    </div>
  );
}
