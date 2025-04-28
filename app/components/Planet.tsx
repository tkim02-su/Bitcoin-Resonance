'use client';

import { useLoader, useFrame } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { useRef } from 'react';
import * as THREE from 'three';

interface PlanetProps {
  position: [number, number, number];
  size: number;
  planetFolder: string;
  onClick?: () => void;
}

export default function Planet({ position, size, planetFolder, onClick }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const [diffuse, normal, roughness] = useLoader(TextureLoader, [
    `/planets/${planetFolder}/diffuse.jpg`,
    `/planets/${planetFolder}/normal.jpg`,
    `/planets/${planetFolder}/roughness.jpg`,
  ]);

  // 🎨 랜덤 스타일 요소 추가
  const rotationSpeed = Math.random() * 0.003 + 0.001; // 0.001 ~ 0.004
  const randomMetalness = Math.random() * 0.3;         // 0.0 ~ 0.3
  const randomRoughness = Math.random() * 0.5 + 0.5;    // 0.5 ~ 1.0
  const randomEmissiveColor = new THREE.Color(`hsl(${Math.random() * 360}, 40%, 25%)`);
  const randomEmissiveIntensity = Math.random() * 0.6 + 0.2; // 0.2 ~ 0.8

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <mesh position={position} ref={meshRef} onClick={onClick}>
      <sphereGeometry args={[size, 64, 64]} />
      <meshStandardMaterial
        map={diffuse}
        normalMap={normal}
        roughnessMap={roughness}
        roughness={randomRoughness}
        metalness={randomMetalness}
        emissive={randomEmissiveColor}
        emissiveIntensity={randomEmissiveIntensity}
        toneMapped={false}
      />
    </mesh>
  );
}
