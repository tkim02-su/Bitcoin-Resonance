'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface PlanetStoryCardProps {
  name: string;
  description: string;
  mission: string;
  symbol: string;
  link: string;
  onAbort: () => void;
}

export default function PlanetStoryCard({ name, description, mission, symbol, link, onAbort }: PlanetStoryCardProps) {
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunch = () => {
    setIsLaunching(true);
    setTimeout(() => {
      window.open(link, '_blank');
      setIsLaunching(false);
      onAbort(); // Launch 끝나고 자동 Abort
    }, 3000);
  };

  const handleAbort = () => {
    setIsLaunching(false);
    onAbort();
  };

  return (
    <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl shadow-2xl border-2 border-gray-700 w-96 max-w-full text-white space-y-6 z-30 overflow-hidden">
      
      {/* 카드 헤더 */}
      <h2 className="text-3xl font-bold text-center tracking-wide">🚀 {name}</h2>
      <p className="text-center text-gray-400 text-sm">({symbol.toUpperCase()})</p>

      {/* 설명 */}
      <div className="mt-4 space-y-3 text-center">
        <p className="text-gray-300 text-sm">{description}</p>
        <p className="text-indigo-400 text-sm font-semibold">Mission: {mission}</p>
      </div>

      {/* 버튼 */}
      <div className="flex justify-center space-x-6 mt-6">
        <button
          onClick={handleLaunch}
          className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-full text-black font-bold transition shadow-lg"
          disabled={isLaunching}
        >
          {isLaunching ? 'Launching...' : 'Launch'}
        </button>
        <button
          onClick={handleAbort}
          className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-full text-black font-bold transition shadow-lg"
          disabled={isLaunching}
        >
          Abort
        </button>
      </div>

      {/* Launching 애니메이션 */}
      <AnimatePresence>
        {isLaunching && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: -400 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: 'easeInOut' }}
            className="absolute left-1/2 transform -translate-x-1/2 top-full text-4xl"
          >
            🚀
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launching 로그 출력 */}
      {isLaunching && (
        <div className="mt-8 p-4 bg-gray-800 rounded-lg text-xs text-left">
          <p className="text-green-400">[SYSTEM] Launch sequence initiated for <span className="font-bold">{name}</span> ({symbol.toUpperCase()})</p>
          <p className="text-blue-400 mt-1">[OBJECTIVE] {mission}</p>
          <p className="text-cyan-400 mt-2 underline">Preparing for liftoff...</p>
        </div>
      )}
    </div>
  );
}
