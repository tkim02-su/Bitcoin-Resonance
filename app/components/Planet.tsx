'use client';

import { useLoader, useFrame } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

interface PlanetProps {
  position: [number, number, number];
  size: number;
  planetFolder: string;
  onClick?: () => void;
}

export default function Planet({ position, size, planetFolder, onClick }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // ✨ Lazy Load: diffuse만 먼저 불러오기 (가벼운걸로)
  const [diffuse] = useLoader(TextureLoader, [
    `/planets/${planetFolder}/diffuse.jpg`,
  ]);

  // ✨ 매번 random rotation speed
  const rotationSpeed = useMemo(() => Math.random() * 0.002 + 0.0005, []);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <mesh position={position} ref={meshRef} onClick={onClick}>
      <sphereGeometry args={[size, 48, 48]} /> {/* 💡 64→48로 살짝 가볍게 */}
      <meshStandardMaterial
        map={diffuse}
        roughness={0.8}                      // ✨ 더 부드럽게
        metalness={0.1}
        emissive={new THREE.Color(0x333333)}  // ✨ 살짝 빛나는 톤
        emissiveIntensity={0.5}
        toneMapped={false}
      />
    </mesh>
  );
}
