// app/components/StarfieldCanvas.tsx
'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speed: number;
  vx: number;
  vy: number;
  color: string;
}

interface StarfieldCanvasProps {
  volume: number;
}

export default function StarfieldCanvas({ volume }: StarfieldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const maxStars = Math.min(300, Math.floor(volume / 1_000_000_000) * 10);
    const stars: Star[] = [];
    const colors = ['#ffffff', '#b8caff', '#ffe9b5', '#d1b3ff'];

    for (let i = 0; i < maxStars; i++) {
      const layer = Math.random();
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: layer * 1.5 + 0.2,
        alpha: Math.random() * 0.8 + 0.2,
        speed: layer * 0.3 + 0.05,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    starsRef.current = stars;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (let star of starsRef.current) {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.shadowBlur = 4;
        ctx.shadowColor = star.color;
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [volume]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0"
      style={{ backgroundColor: 'transparent', pointerEvents: 'none' }}
    />
  );
}
