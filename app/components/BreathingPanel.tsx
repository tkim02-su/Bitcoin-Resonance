'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Image from 'next/image'; // <-- added

interface BreathingPanelProps {
  volume: number;
}

export default function BreathingPanel({ volume }: BreathingPanelProps) {
  const controls = useAnimation();
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioEnabledRef = useRef(audioEnabled);

  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
  }, [audioEnabled]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/heartbeat.mp3');
      audioRef.current.volume = 0.7;
    }
  }, []);

  useEffect(() => {
    if (!audioEnabled && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [audioEnabled]);

  useEffect(() => {
    let cancelled = false;

    const scale = 1 + Math.min(3.5, Math.log10(volume / 1_000_000_000 + 1) * 1.5);
    const interval = Math.max(200, 2500 - Math.log10(volume + 1) * 300);

    const run = async () => {
      while (!cancelled) {
        await controls.start({
          scale: scale + 0.4,
          opacity: 0.85,
          transition: { duration: 0.25, ease: 'easeOut' },
        });

        if (audioEnabledRef.current && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }

        await controls.start({
          scale: scale - 0.15,
          opacity: 1,
          transition: { duration: 0.25, ease: 'easeInOut' },
        });

        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [volume, controls]); // <-- added controls

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[600px]">
      <motion.div animate={controls} className="w-[220px] h-[220px] z-0 mb-20">
        <Image
          src="/heart.svg"
          alt="Beating Heart"
          width={220}
          height={220}
          className="object-contain w-full h-full"
        />
      </motion.div>

      <button
        onClick={() => setAudioEnabled((prev) => !prev)}
        className="absolute bottom-4 left-4 px-4 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition z-10 shadow"
      >
        {audioEnabled ? '🔇 OFF' : '🔊 ON'}
      </button>
    </div>
  );
}
