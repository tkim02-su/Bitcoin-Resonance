'use client';

import { motion } from 'framer-motion';

export default function LoadingHeartbeat() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white z-50">
      <motion.img
        src="/heart.svg"
        alt="Loading Heartbeat"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-48 h-48 mb-6"
      />
      <p className="text-lg text-gray-300">Syncing with the blockchain...</p>
    </div>
  );
}
