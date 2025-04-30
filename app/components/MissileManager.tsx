'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface PlanetInfo {
  position: [number, number, number];
  scale: number;
  color: THREE.Color;
  rotationSpeed: number;
}

interface MissileManagerProps {
  missilesRef: React.RefObject<{
    position: THREE.Vector3;
    direction: THREE.Vector3;
    startTime: number;
    active: boolean;
  }[]>;
  planets: PlanetInfo[];
  onExplode: (planetIndex: number) => void;
}

const MAX_MISSILES = 20;

// create one shared AudioContext
const audioCtx = typeof window !== 'undefined'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ? new (window.AudioContext || (window as any).webkitAudioContext)()
  : null;

export default function MissileManager({ missilesRef, planets, onExplode }: MissileManagerProps) {
  const { scene } = useThree();
  const instRef = useRef<THREE.InstancedMesh | null>(null);
  const dummy = useRef(new THREE.Object3D());
  const tempPos = useRef(new THREE.Vector3());
  const tempDir = useRef(new THREE.Vector3());
  const exploding = useRef(new Set<number>());

  useEffect(() => {
    // init missile pool
    const geom = new THREE.SphereGeometry(0.3, 8, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: '#f8d34b',
      emissive: new THREE.Color('#ffd700'),
      emissiveIntensity: 1,
    });
    const inst = new THREE.InstancedMesh(geom, mat, MAX_MISSILES);
    inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(inst);
    instRef.current = inst;

    // ensure missilesRef.current exists
    if (!missilesRef.current) {
      missilesRef.current = Array(MAX_MISSILES).fill(null).map(() => ({
        position: new THREE.Vector3(),
        direction: new THREE.Vector3(),
        startTime: 0,
        active: false
      }));
    }

    return () => {
      // clean up
      inst.geometry.dispose();
      inst.material.dispose();
      scene.remove(inst);
    };
  }, [scene, missilesRef]);

  useFrame(() => {
    const inst = instRef.current;
    if (!inst || !missilesRef.current) return;

    let visibleCount = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    missilesRef.current.forEach((m, idx) => {
      if (!m.active) return;

      // advance position
      tempPos.current.copy(m.position);
      tempDir.current.copy(m.direction).multiplyScalar(0.8);
      m.position.add(tempDir.current);

      // collision detection
      for (let pi = 0; pi < planets.length; pi++) {
        if (exploding.current.has(pi)) continue;
        const planet = planets[pi];
        const planetPos = tempDir.current.set(...planet.position);
        if (m.position.distanceTo(planetPos) < planet.scale + 0.5) {
          // mark exploded
          exploding.current.add(pi);
          onExplode(pi);

          // optional sound
          if (audioCtx) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.value = 220;
            osc.connect(gain).connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.5);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
          }

          // kill this missile
          m.active = false;
          break;
        }
      }

      // bounds check
      if (m.active && m.position.length() > 300) {
        m.active = false;
      }

      // render instance
      if (m.active) {
        dummy.current.position.copy(m.position);
        dummy.current.lookAt(m.position.clone().add(m.direction));
        dummy.current.updateMatrix();
        inst.setMatrixAt(visibleCount, dummy.current.matrix);
        visibleCount++;
      }
    });

    inst.count = visibleCount;
    inst.instanceMatrix.needsUpdate = true;
  });

  return null;
}
