'use client';

import { useLoader, useFrame } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { useRef } from 'react';
import * as THREE from 'three';

interface PlanetProps {
  position: [number, number, number];
  size: number;
  planetFolder: string; // 폴더명 ex) planet1, planet2
  onClick?: () => void;
}

export default function Planet({ position, size, planetFolder, onClick }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const [diffuse, normal, roughness] = useLoader(TextureLoader, [
    `/planets/${planetFolder}/diffuse.jpg`,
    `/planets/${planetFolder}/normal.jpg`,
    `/planets/${planetFolder}/roughness.jpg`,
  ]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001; // 살짝 자전
    }
  });

  return (
    <mesh position={position} ref={meshRef} onClick={onClick}>
      <sphereGeometry args={[size, 64, 64]} />
      <meshStandardMaterial
        map={diffuse}
        normalMap={normal}
        roughnessMap={roughness}
        roughness={1}
      />
    </mesh>
  );
}
