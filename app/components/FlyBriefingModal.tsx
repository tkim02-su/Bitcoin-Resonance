'use client';

import { motion } from 'framer-motion';

interface FlyBriefingModalProps {
  onStart: () => void;
  onCancel: () => void;
}

export default function FlyBriefingModal({ onStart, onCancel }: FlyBriefingModalProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 text-white z-50">
      <motion.h1
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-4xl font-extrabold mb-8 tracking-wide"
      >
        🛰️ Pilot Briefing
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-lg max-w-lg text-center mb-10"
      >
        Navigate carefully. If you hit a planet or exit the galaxy boundary, your spaceship will crash. 
        Stay alert, and good luck, pilot!
      </motion.p>

      <div className="flex space-x-8">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg transition"
        >
          🚀 Start Mission
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCancel}
          className="px-8 py-4 bg-gray-300 hover:bg-gray-400 text-black font-bold rounded-full shadow-lg transition"
        >
          ❌ Cancel
        </motion.button>
      </div>
    </div>
  );
}
