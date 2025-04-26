'use client';

import * as THREE from 'three';
import { useRef, useState, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';

interface PlanetProps {
  position: [number, number, number];
  size: number;
  textureUrl: string;
  onClick: () => void;
}

export default function Planet({ position, size, textureUrl, onClick }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, textureUrl);
  const [hovered, setHovered] = useState(false);

  // ✅ 궤도 설정은 useMemo로 "딱 1번만" 계산
  const { radius, initialAngle, speed } = useMemo(() => {
    return {
      radius: Math.sqrt(position[0] ** 2 + position[1] ** 2 + position[2] ** 2),
      initialAngle: Math.random() * Math.PI * 2,
      speed: 0.1 + Math.random() * 0.05,
    };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      // 자전
      meshRef.current.rotation.y += 0.001;

      // 궤도 이동
      const angle = initialAngle + t * speed;
      meshRef.current.position.x = Math.cos(angle) * radius;
      meshRef.current.position.z = Math.sin(angle) * radius;
      meshRef.current.position.y = position[1]; // y축은 고정
    }
  });

  return (
    <mesh
      ref={meshRef}
      scale={[size, size, size]}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        map={texture}
        emissive={hovered ? new THREE.Color('#6666ff') : new THREE.Color('#222222')}
        emissiveIntensity={hovered ? 0.5 : 0.2}
        roughness={0.8}
        metalness={0}
      />
    </mesh>
  );
}
