import { useRef, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

interface PlanetInfo {
  position: [number, number, number];
  scale: number;
  color: THREE.Color;
  rotationSpeed: number;
}

interface PlanetsInstancedProps {
  planets: PlanetInfo[];
  onPlanetClick: (index: number) => void;
  destroyedPlanets?: Set<number>;
}

// Module-level geometry & material: created once
const SPHERE_GEOMETRY = new THREE.SphereGeometry(1, 16, 16);
const PLANET_MATERIAL = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.7,
  metalness: 0.2,
  emissive: new THREE.Color(0x111111),
  emissiveIntensity: 0.6,
  toneMapped: false,
});

export default function PlanetsInstanced({
  planets,
  onPlanetClick,
  destroyedPlanets = new Set(),
}: PlanetsInstancedProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());
  const colorAttr = useRef<THREE.Color>(new THREE.Color());

  // Ensure GPU knows we'll dynamically update instance matrices
  useMemo(() => {
    if (meshRef.current) {
      meshRef.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      if (meshRef.current.instanceColor)
        meshRef.current.instanceColor.setUsage(THREE.DynamicDrawUsage);
    }
  }, []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const time = clock.getElapsedTime();
    let idx = 0;

    for (let i = 0; i < planets.length; i++) {
      const planet = planets[i];

      dummy.current.position.set(...planet.position);

      if (destroyedPlanets.has(i)) {
        // Hide destroyed planets by scaling to zero
        dummy.current.scale.setScalar(0);
      } else {
        // rotate and scale
        const rotationY = (planet.rotationSpeed + 0.001) * time;
        dummy.current.rotation.set(0, rotationY, 0);
        dummy.current.scale.setScalar(planet.scale);
      }

      dummy.current.updateMatrix();
      mesh.setMatrixAt(idx, dummy.current.matrix);

      // set color only on non-destroyed
      if (mesh.instanceColor) {
        if (destroyedPlanets.has(i)) {
          // nearly transparent gray
          colorAttr.current.setRGB(0.1, 0.1, 0.1);
        } else {
          // use original color
          colorAttr.current.copy(planet.color);
        }
        mesh.setColorAt(idx, colorAttr.current);
      }

      idx++;
    }

    mesh.count = idx; // draw only active slots
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    if (e.instanceId !== undefined && !destroyedPlanets.has(e.instanceId)) {
      document.body.style.cursor = 'pointer';
    }
  };
  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
  };
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (e.instanceId !== undefined && !destroyedPlanets.has(e.instanceId)) {
      onPlanetClick(e.instanceId);
    }
  };

  return (
    <instancedMesh
      ref={meshRef}
      args={[SPHERE_GEOMETRY, PLANET_MATERIAL, planets.length]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerDown={handlePointerDown}
      castShadow
      receiveShadow
    />
  );
}