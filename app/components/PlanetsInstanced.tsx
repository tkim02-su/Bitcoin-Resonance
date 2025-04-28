'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlanetsInstancedProps {
  count: number;
}

export default function PlanetsInstanced({ count }: PlanetsInstancedProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = new THREE.Object3D();

  const transforms = useRef(
    Array.from({ length: count }).map(() => ({
      position: [
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
      ] as [number, number, number],
      scale: Math.random() * 1.5 + 0.5,
      rotationSpeed: Math.random() * 0.002 + 0.001,
      rotationY: Math.random() * Math.PI * 2,
      baseColor: new THREE.Color(`hsl(${Math.random() * 360}, 50%, 50%)`),
      emissiveColor: new THREE.Color(`hsl(${Math.random() * 360}, 30%, 30%)`),
      roughness: Math.random() * 0.5 + 0.3,
      metalness: Math.random() * 0.4,
    }))
  ).current;

  useEffect(() => {
    if (!meshRef.current) return;

    transforms.forEach((transform, i) => {
      dummy.position.set(...transform.position);
      dummy.scale.setScalar(transform.scale);
      dummy.rotation.set(0, transform.rotationY, 0);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, transform.baseColor);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;

    transforms.forEach((transform, i) => {
      transform.rotationY += transform.rotationSpeed;
      dummy.position.set(...transform.position);
      dummy.scale.setScalar(transform.scale);
      dummy.rotation.set(0, transform.rotationY, 0);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
    >
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        vertexColors
        roughness={0.6}
        metalness={0.3}
        emissiveIntensity={0.2}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
