'use client';

import { useState, useEffect } from 'react';
import * as THREE from 'three';

interface OrbitCatchProps {
  onSuccess: () => void;
}

export default function OrbitCatch({ onSuccess }: OrbitCatchProps) {
  const [rotation, setRotation] = useState(0);
  const [targetStart, setTargetStart] = useState(Math.random() * Math.PI * 2);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      setRotation((prev) => (prev + 0.02) % (Math.PI * 2));
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const handleClick = () => {
    const diff = Math.abs(rotation - targetStart);
    if (diff < 0.3 || diff > Math.PI * 2 - 0.3) {
      // ✅ Success
      setIsCompleted(true);
      setTimeout(() => {
        onSuccess();
      }, 500); // small delay for user feedback
    } else {
      // ❌ Fail: Reset target
      setTargetStart(Math.random() * Math.PI * 2);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-4">
      <div className="relative w-48 h-48">
        {/* Circle */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-400" />
        
        {/* Target Zone */}
        <div
          className="absolute w-10 h-10 bg-green-400 opacity-70 rounded-full"
          style={{
            transform: `translate(-50%, -50%) rotate(${targetStart}rad) translate(90px)`,
            top: '50%',
            left: '50%',
          }}
        />

        {/* Rotating Marker */}
        <div
          className="absolute w-2 h-2 bg-white rounded-full"
          style={{
            transform: `translate(-50%, -50%) rotate(${rotation}rad) translate(90px)`,
            top: '50%',
            left: '50%',
          }}
        />
      </div>

      {!isCompleted ? (
        <button
          onClick={handleClick}
          className="mt-6 px-6 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition"
        >
          Click to Catch!
        </button>
      ) : (
        <div className="mt-6 text-green-400 font-bold text-lg">✅ Mission Accepted!</div>
      )}
    </div>
  );
}
