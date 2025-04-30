'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ExplosionEffectProps {
  position: [number, number, number];
  scale: number;
  onComplete: () => void;
}

export default function ExplosionEffect({ position, scale, onComplete }: ExplosionEffectProps) {
  // Use refs to minimize React updates
  const meshRef = useRef<THREE.Mesh>(null);
  const startTimeRef = useRef<number>(Date.now());
  const completedRef = useRef<boolean>(false);
  const materialRef = useRef<THREE.MeshBasicMaterial>(
    new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ff5500'),
      transparent: true,
      opacity: 1.0,
      depthWrite: false // Improve performance
    })
  );
  
  // Setup on mount
  useEffect(() => {
    if (meshRef.current) {
      // Position the mesh
      meshRef.current.position.set(...position);
      // Reset for animation
      startTimeRef.current = Date.now();
      completedRef.current = false;
    }
    
    return () => {
      // Cleanup on unmount
      if (materialRef.current) {
        materialRef.current.dispose();
      }
    };
  }, [position]);

  // Simple animation
  useFrame(() => {
    if (!meshRef.current || completedRef.current) return;
    
    const elapsedTime = (Date.now() - startTimeRef.current) / 1000;
    const duration = 0.5; // Short duration to prevent lag
    const lifeProgress = Math.min(elapsedTime / duration, 1.0);
    
    // Scale the explosion
    const currentScale = scale * (1 + lifeProgress * 2);
    meshRef.current.scale.set(currentScale, currentScale, currentScale);
    
    // Update opacity
    if (materialRef.current) {
      materialRef.current.opacity = Math.max(0, 1.0 - lifeProgress);
    }
    
    // Complete when done
    if (lifeProgress >= 1.0 && !completedRef.current) {
      completedRef.current = true;
      // Call onComplete on next frame
      setTimeout(() => {
        onComplete();
      }, 0);
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 8, 8]} /> {/* Low poly for performance */}
      <primitive object={materialRef.current} attach="material" />
    </mesh>
  );
}