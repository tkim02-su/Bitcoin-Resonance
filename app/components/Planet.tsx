'use client';

import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber';

interface PlanetProps {
  position: [number, number, number];
  size: number;
  textureUrl: string;
  onClick: (position: [number, number, number]) => void; // ✅ 타입 명확히
}

export default function Planet({ position, size, textureUrl, onClick }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, textureUrl);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  const handleClick = () => {
    if (meshRef.current) {
      const pos = meshRef.current.position;
      onClick([pos.x, pos.y, pos.z]); // ✅ 클릭 시 현재 포지션 넘기기
    }
  };

  return (
    <mesh ref={meshRef} position={position} onClick={handleClick}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial map={texture} emissive={'#ffffff'} emissiveIntensity={0.1} />
    </mesh>
  );
}
