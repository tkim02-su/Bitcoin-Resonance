'use client';

import { motion } from 'framer-motion';

interface CrashOverlayProps {
  onReturnToWebMode: () => void;
  onResumeFlyMode: () => void;
}

export default function CrashOverlay({ onReturnToWebMode, onResumeFlyMode }: CrashOverlayProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 text-white z-50">
      <motion.h1
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-4xl font-extrabold mb-10 tracking-wide text-red-500"
      >
        🚨 The Spaceship Crashed!
      </motion.h1>

      <div className="flex flex-col space-y-6 mt-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onResumeFlyMode}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg transition"
        >
          🚀 Resume Mission
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReturnToWebMode}
          className="px-8 py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-full shadow-lg transition"
        >
          🏠 Return to Web Mode
        </motion.button>
      </div>
    </div>
  );
}
