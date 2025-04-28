'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
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
  const dummy = new THREE.Object3D();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!meshRef.current) return;

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

    planets.forEach((planet, i) => {
      const rotationY = (planet.rotationSpeed + 0.001) * clock.elapsedTime;
      dummy.position.set(...planet.position);

      let finalScale = planet.scale;
      let baseColor = planet.color.clone();

      if (hoveredIndex === i) {
        const pulse = Math.sin(clock.elapsedTime * 6) * 0.03 + 1.05; // ✨ smaller subtle pulse
        finalScale *= pulse;

        // Instead of pure white, brighten original color
        baseColor.offsetHSL(0, 0, 0.2); // Lighten color slightly
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

  const handlePointerOver = (e: any) => {
    if (e.instanceId !== undefined) {
      setHoveredIndex(e.instanceId);
    }
  };

  const handlePointerOut = () => {
    setHoveredIndex(null);
  };

  const handlePointerDown = (e: any) => {
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
      <sphereGeometry args={[1, 64, 64]} /> {/* ✅ Higher poly sphere for smoothness */}
      <meshStandardMaterial
        vertexColors
        roughness={0.7}        // ✅ Looks dusty / rocky
        metalness={0.2}        // ✅ Tiny bit metallic for reflections
        emissive={new THREE.Color(0x111111)}  // ✅ Subtle base glow
        emissiveIntensity={0.6} // ✅ Lower glow, more natural
        toneMapped={false}
      />
    </instancedMesh>
  );
}
