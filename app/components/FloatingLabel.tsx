'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface FloatingLabelProps {
  text: string;
  position: [number, number, number];
  scale: number;
}

export default function FloatingLabel({ text, position, scale }: FloatingLabelProps) {
  const labelRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (labelRef.current) {
      labelRef.current.lookAt(camera.position);

      // 🚀 Dynamic fading based on distance
      const distance = camera.position.distanceTo(new THREE.Vector3(...position));
      const maxVisibleDistance = 100; // Beyond 100 units, start fading
      const minVisibleDistance = 20;  // Within 20 units, fully visible

      let opacity = 1.0;
      if (distance > minVisibleDistance) {
        opacity = 1 - (distance - minVisibleDistance) / (maxVisibleDistance - minVisibleDistance);
        opacity = Math.max(0, Math.min(1, opacity)); // Clamp between 0 and 1
      }

      // Apply opacity dynamically
      (labelRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
      (labelRef.current.material as THREE.MeshBasicMaterial).transparent = true;
    }
  });

  return (
    <Text
      ref={labelRef}
      position={[position[0], position[1] + scale * 1.4, position[2]]}
      fontSize={scale * 0.7}
      color="white"
      outlineColor="black"
      outlineWidth={0.2}
      outlineBlur={0.5}
      material-opacity={1} // Initial opacity
      material-transparent={true} // Allow transparency
    >
      {text}
    </Text>
  );
}
