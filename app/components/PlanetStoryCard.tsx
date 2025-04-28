'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import OrbitCatch from './OrbitCatch'; // ✅ Import mini-game

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
  const [missionCompleted, setMissionCompleted] = useState(false);

  const handleLaunch = () => {
    setIsLaunching(true);
    setTimeout(() => {
      window.open(link, '_blank');
      setIsLaunching(false);
      onAbort(); // 🚀 After launch, close card
    }, 3000);
  };

  const handleAbort = () => {
    setIsLaunching(false);
    onAbort();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-30 flex items-start justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleAbort} // ✅ Clicking background triggers closing
      >
        <motion.div
          className="relative mt-24 bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl shadow-2xl border-2 border-gray-700 w-96 max-w-full text-white space-y-6 overflow-hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()} // ✅ Prevent clicks inside the card from closing it
        >
          {/* Header */}
          <h2 className="text-3xl font-bold text-center tracking-wide">🚀 {name}</h2>
          <p className="text-center text-gray-400 text-sm">({symbol.toUpperCase()})</p>

          {/* Content */}
          <div className="mt-4 space-y-3 text-center">
            <p className="text-gray-300 text-sm">{description}</p>
            <p className="text-indigo-400 text-sm font-semibold">Mission: {mission}</p>
          </div>

          {/* OrbitCatch Mini-Game */}
          {!missionCompleted ? (
            <div className="flex justify-center">
              <OrbitCatch onSuccess={() => setMissionCompleted(true)} />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center mt-4"
            >
              <div className="text-green-400 font-bold text-lg mb-2">✅ Mission Accepted!</div>
            </motion.div>
          )}

          {/* Launch / Abort Buttons */}
          {missionCompleted && (
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
          )}

          {/* Launching Rocket Animation */}
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

          {/* Launching Logs */}
          {isLaunching && (
            <div className="mt-8 p-4 bg-gray-800 rounded-lg text-xs text-left">
              <p className="text-green-400">[SYSTEM] Launch sequence initiated for <span className="font-bold">{name}</span> ({symbol.toUpperCase()})</p>
              <p className="text-blue-400 mt-1">[OBJECTIVE] {mission}</p>
              <p className="text-cyan-400 mt-2 underline">Preparing for liftoff...</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
