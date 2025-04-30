'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';

const PARTICLES_COUNT = 200;

export default function ParticleExplosion() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate particles with random properties
  const particles = Array.from({ length: PARTICLES_COUNT }).map((_, i) => {
    const size = Math.random() * 6 + 1;
    const distance = Math.random() * 400 + 50;
    const duration = Math.random() * 2 + 1.5;
    const delay = Math.random() * 0.4;
    const angle = Math.random() * Math.PI * 2;
    const color = getRandomColor();
    
    return {
      id: i,
      size,
      distance,
      duration,
      delay,
      angle,
      color,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    };
  });

  // Create wave effect particles
  const waveParticles = Array.from({ length: 80 }).map((_, i) => {
    const angle = (i / 80) * Math.PI * 2;
    const delay = i * 0.01;
    return {
      id: i + PARTICLES_COUNT,
      angle,
      delay,
    };
  });

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center"
    >
      {/* Initial flash of light */}
      <motion.div
        className="absolute w-4 h-4 bg-white rounded-full"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 8, 0],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 1.2,
          times: [0, 0.2, 1]
        }}
      />

      {/* Expanding ring */}
      <motion.div
        className="absolute w-10 h-10 rounded-full border-2 border-white"
        style={{ backgroundColor: 'transparent' }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{
          scale: 40,
          opacity: 0
        }}
        transition={{
          duration: 2.5,
          ease: "easeOut"
        }}
      />

      {/* Secondary expanding ring */}
      <motion.div
        className="absolute w-10 h-10 rounded-full border border-blue-400"
        style={{ backgroundColor: 'transparent' }}
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{
          scale: 20,
          opacity: 0
        }}
        transition={{
          duration: 2,
          delay: 0.3,
          ease: "easeOut"
        }}
      />

      {/* Explosion particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
          }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{
            x: particle.x,
            y: particle.y,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: "easeOut",
            times: [0, 0.2, 1]
          }}
        />
      ))}

      {/* Wave effect */}
      {waveParticles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 bg-blue-400 rounded-full"
          initial={{
            x: 0,
            y: 0,
            opacity: 0,
          }}
          animate={{
            x: Math.cos(particle.angle) * 150,
            y: Math.sin(particle.angle) * 150,
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 1.5,
            delay: particle.delay + 0.5,
            ease: "easeOut",
            times: [0, 0.2, 1]
          }}
        />
      ))}
    </div>
  );
}

// Helper function to generate random colors for particles
function getRandomColor() {
  const colors = [
    '#ffffff', // white
    '#64b5f6', // light blue
    '#90caf9', // very light blue
    '#bbdefb', // extremely light blue
    '#2196f3', // blue
    '#ff9800', // orange (for bitcoin)
    '#ffc107', // amber (for bitcoin)
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}