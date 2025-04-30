'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface PlanetInfo {
  position: [number, number, number];
  scale: number;
  color: THREE.Color;
  rotationSpeed: number;
}

interface SpaceshipFlyControllerProps {
  setCrashed: (value: boolean) => void;
  planets: PlanetInfo[];
}

export default function SpaceshipFlyController({ setCrashed, planets }: SpaceshipFlyControllerProps) {
  const { camera } = useThree();
  const keys = useRef<{ [key: string]: boolean }>({});
  const direction = useRef(new THREE.Vector3());
  const lastSafePosition = useRef(new THREE.Vector3(0, 0, 20));
  const up = new THREE.Vector3(0, 1, 0);
  const rollSpeed = 0.005;
  const invincibilityFramesRef = useRef(0);
  const hasBeenCrashed = useRef(false);
  
  useEffect(() => {
    // Reset crash status when component mounts
    hasBeenCrashed.current = false;
    
    // Expose the grantInvincibilityFrames method
    (window as any).grantSpaceshipInvincibility = grantInvincibilityFrames;
    
    const handleKeyDown = (e: KeyboardEvent) => (keys.current[e.key.toLowerCase()] = true);
    const handleKeyUp = (e: KeyboardEvent) => (keys.current[e.key.toLowerCase()] = false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      // Clean up global reference
      delete (window as any).grantSpaceshipInvincibility;
    };
  }, []);

  useFrame((_, delta) => {
    // Skip updates if we've already crashed
    if (hasBeenCrashed.current) return;
    
    // Handle invincibility frames (brief period after shooting where you can't crash)
    if (invincibilityFramesRef.current > 0) {
      invincibilityFramesRef.current -= 1;
    }
    
    const moveSpeed = 80;
    direction.current.set(0, 0, -1).applyQuaternion(camera.quaternion);

    if (keys.current['w']) camera.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -rollSpeed));
    if (keys.current['s']) camera.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), rollSpeed));
    if (keys.current['a']) camera.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(up, rollSpeed));
    if (keys.current['d']) camera.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(up, -rollSpeed));

    // Save current position before moving
    const currentPosition = camera.position.clone();
    
    // Calculate next position
    const moveDistance = moveSpeed * delta;
    const nextPosition = currentPosition.clone().add(direction.current.clone().multiplyScalar(moveDistance));
    
    // Check if moving would cause a collision
    let willCollide = false;
    
    // Check boundaries
    if (nextPosition.length() > 450) {
      willCollide = true;
    }
    
    // Check planet collisions
    for (const planet of planets) {
      const distance = new THREE.Vector3(...planet.position).distanceTo(nextPosition);
      if (distance < planet.scale + 2) {
        willCollide = true;
        break;
      }
    }
    
    // Only move if we won't collide, or if invincibility frames are active
    if (!willCollide || invincibilityFramesRef.current > 0) {
      // Move is safe, update position
      camera.position.copy(nextPosition);
      lastSafePosition.current.copy(camera.position);
    } else {
      // Will collide - trigger crash only once
      if (!hasBeenCrashed.current) {
        hasBeenCrashed.current = true;
        // Delay the crash to prevent immediate crash after shooting
        setTimeout(() => {
          setCrashed(true);
        }, 100);
      }
    }
  });
  
  // Method to grant temporary invincibility when shooting
  const grantInvincibilityFrames = () => {
    invincibilityFramesRef.current = 10; // 10 frames of invincibility
  };

  return null;
}