// app/components/EnhancedStars.tsx
'use client';

import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';

export default function EnhancedStars() {
  const pointsRef = useRef<THREE.Points>(null);
  const texture = useLoader(THREE.TextureLoader, 'star.png');

  const starCount = 90000;
  const starGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    for (let i = 0; i < starCount; i++) {
      const x = (Math.random() - 0.5) * 200;
      const y = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      positions.push(x, y, z);

      const distance = Math.sqrt(x * x + y * y + z * z);
      const baseColor = new THREE.Color("#FFDF00"); // soft creamy yellow
      baseColor.offsetHSL(0, 0, -Math.min(distance / 300, 0.4));

      colors.push(baseColor.r, baseColor.g, baseColor.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }, []);

  const starMaterial = useMemo(() => {
    texture.needsUpdate = true;
    return new THREE.PointsMaterial({
      size: 1.1,
      map: texture,
      transparent: true,
      alphaTest: 0.4,
      vertexColors: true,
      sizeAttenuation: true,
      depthWrite: false,
    });
  }, [texture]);

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <points ref={pointsRef} geometry={starGeometry} material={starMaterial} />
  );
}
