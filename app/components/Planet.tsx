'use client';

import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';

interface PlanetProps {
  position: [number, number, number];
  size: number;
  imagePath: string; // ⭐️ 새로 추가된 props
  onClick?: () => void;
}

export default function Planet({ position, size, imagePath, onClick }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, imagePath); // ⭐️ 텍스처 불러오기

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh position={position} ref={meshRef} onClick={onClick}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
