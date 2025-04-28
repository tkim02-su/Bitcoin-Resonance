'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

interface PlanetsInstancedProps {
  planets: {
    position: [number, number, number];
    scale: number;
    color: THREE.Color;
    rotationSpeed: number;
  }[];
  onPlanetClick: (index: number) => void;
}

export default function PlanetsInstanced({ planets, onPlanetClick }: PlanetsInstancedProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D()); // ✅ Move dummy into a ref
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = dummyRef.current;

    planets.forEach((planet, i) => {
      dummy.position.set(...planet.position);
      dummy.scale.setScalar(planet.scale);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, planet.color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [planets]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const dummy = dummyRef.current;

    planets.forEach((planet, i) => {
      const rotationY = (planet.rotationSpeed + 0.001) * clock.elapsedTime;
      dummy.position.set(...planet.position);

      let finalScale = planet.scale;
      const baseColor = planet.color.clone(); // ✅ const instead of let

      if (hoveredIndex === i) {
        const pulse = Math.sin(clock.elapsedTime * 6) * 0.03 + 1.05; // ✨ Subtle hover pulse
        finalScale *= pulse;

        baseColor.offsetHSL(0, 0, 0.2); // ✅ Slight lighten on hover
      }

      dummy.scale.setScalar(finalScale);
      dummy.rotation.set(0, rotationY, 0);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, baseColor);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => { // ✅ Proper typing
    if (e.instanceId !== undefined) {
      setHoveredIndex(e.instanceId);
    }
  };

  const handlePointerOut = () => {
    setHoveredIndex(null);
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => { // ✅ Proper typing
    if (e.instanceId !== undefined) {
      onPlanetClick(e.instanceId);
    }
  };

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, planets.length]}
      onPointerDown={handlePointerDown}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[1, 64, 64]} /> {/* ✅ Smooth high poly sphere */}
      <meshStandardMaterial
        vertexColors
        roughness={0.7}        
        metalness={0.2}        
        emissive={new THREE.Color(0x111111)}
        emissiveIntensity={0.6}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
