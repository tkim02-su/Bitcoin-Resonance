'use client';

import { motion } from 'framer-motion';

interface FlyBriefingModalProps {
  onStart: () => void;
  onCancel: () => void;
}

export default function FlyBriefingModal({ onStart, onCancel }: FlyBriefingModalProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-90 text-white z-50 p-6">
      <motion.h1
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-5xl font-extrabold mb-8 tracking-wider text-blue-400"
      >
        🛸 Pilot Mission Briefing
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-lg max-w-2xl text-center mb-10 space-y-6 leading-relaxed"
      >
        <p>Welcome, pilot. Your mission is to freely navigate the Bitcoin Universe.</p>
        <p>
          <span className="text-green-400 font-semibold">W</span>: Pitch Up &nbsp; | &nbsp;
          <span className="text-green-400 font-semibold">S</span>: Pitch Down &nbsp; | &nbsp;
          <span className="text-green-400 font-semibold">A</span>: Yaw Left &nbsp; | &nbsp;
          <span className="text-green-400 font-semibold">D</span>: Yaw Right
        </p>
        <p className="text-yellow-400 font-semibold">
          Caution: Colliding with a planet or leaving the galaxy boundary will cause your spaceship to crash.
        </p>
        <p className="text-gray-400">Stay focused. The Universe is vast. Good luck, Captain.</p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-full shadow-lg transition"
        >
          🚀 Start Mission
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCancel}
          className="px-10 py-4 bg-gray-300 hover:bg-gray-400 text-black text-lg font-bold rounded-full shadow-lg transition"
        >
          ❌ Cancel
        </motion.button>
      </div>
    </div>
  );
}
