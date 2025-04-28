'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import EnhancedStars from './EnhancedStars';
import { OrbitControls as DreiOrbitControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import PlanetStoryCard from './PlanetStoryCard';
import { altcoinDescriptions } from '../../lib/altcoinDescriptions';
import * as THREE from 'three';

interface BitcoinUniverse3DProps {
  exploreMode: boolean;
  setExploreMode: (mode: boolean) => void;
}

interface AltcoinInfo {
  id: string;
  symbol: string;
  name: string;
}

interface PlanetData {
  position: [number, number, number];
  size: number;
  color: THREE.Color;
  roughness: number;
  metalness: number;
  emissive: THREE.Color;
}

function MilkyWayBackground() {
  const texture = new THREE.TextureLoader().load('/textures/milkyway.jpg');

  return (
    <mesh scale={[-500, 500, 500]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

function CustomPlanet({ position, size, color, roughness, metalness, emissive, onClick }: PlanetData & { onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(Math.random() * 1000); // random offset per planet breathing

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0015;
      // 🌟 Breathing animation
      const scale = size + Math.sin(clock.elapsedTime * 1.5 + timeRef.current) * 0.1; 
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={meshRef} position={position} onClick={onClick}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        emissive={emissive}
        emissiveIntensity={0.4} // Make glow slightly stronger
        toneMapped={false}
      />
    </mesh>
  );
}

export default function BitcoinUniverse3D({ exploreMode, setExploreMode }: BitcoinUniverse3DProps) {
  const [selectedAltcoin, setSelectedAltcoin] = useState<AltcoinInfo | null>(null);
  const [altcoins, setAltcoins] = useState<AltcoinInfo[]>([]);
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);
  const [cameraZ, setCameraZ] = useState(5);
  const [planetDataList, setPlanetDataList] = useState<PlanetData[]>([]);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useEffect(() => {
    const fetchAltcoins = async () => {
      try {
        const res = await fetch('/api/altcoins');
        const data = await res.json();
        if (Array.isArray(data)) {
          setAltcoins(data.slice(0, 100));
        }
      } catch (err) {
        console.error('Failed to fetch altcoins:', err);
      }
    };
    fetchAltcoins();
  }, []);

  useEffect(() => {
    if (exploreMode) {
      setCameraZ(20);

      const generatedPlanets = Array.from({ length: 150 }).map(() => {
        const hue = Math.random() * 360;
        const saturation = Math.random() * 40 + 30; // 30%–70% saturation
        const lightness = Math.random() * 20 + 30;  // 30%–50% lightness
        
        return {
          position: [
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200,
          ] as [number, number, number],
          size: Math.random() * 1.5 + 0.5,
          color: new THREE.Color(`hsl(${hue}, ${saturation}%, ${lightness}%)`),
          roughness: Math.random() * 0.5 + 0.3, 
          metalness: Math.random() * 0.5,
          emissive: new THREE.Color(`hsl(${hue}, ${saturation * 0.7}%, ${lightness * 0.7}%)`),
        };
      });

      setPlanetDataList(generatedPlanets);
    } else {
      setCameraZ(5);
      setSelectedAltcoin(null);
      setPlanetDataList([]);
    }
  }, [exploreMode]);

  const handlePlanetClick = (index: number) => {
    const altcoin = altcoins[index % altcoins.length];
    setSelectedAltcoin(altcoin);
  };

  const handleCloseInfo = () => {
    setSelectedAltcoin(null);
  };

  const handleReturnToWebMode = () => {
    setExploreMode(false);
    setSelectedAltcoin(null);
  };

  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }} onCreated={({ camera }) => { cameraRef.current = camera as THREE.PerspectiveCamera; }}>
        <Suspense fallback={<FallbackLoading />}>
          {exploreMode && <MilkyWayBackground />}

          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
          <pointLight position={[0, 5, 5]} intensity={2} distance={100} />
          <pointLight position={[5, 5, 5]} intensity={1} />

          <EnhancedStars exploreMode={exploreMode} />

          {exploreMode && (
            <>
              <DreiOrbitControls
                ref={orbitControlsRef}
                enableZoom
                enableRotate
                enablePan={false}
                zoomSpeed={0.3}
                rotateSpeed={0.3}
                minDistance={5}
                maxDistance={50}
                enableDamping={true}
                dampingFactor={0.2}
                autoRotate={true}
                autoRotateSpeed={0.2}
              />

              {planetDataList
                .filter(({ position }) => {
                  if (!cameraRef.current) return false;
                  const camPos = cameraRef.current.position;
                  const distance = Math.sqrt(
                    (position[0] - camPos.x) ** 2 +
                    (position[1] - camPos.y) ** 2 +
                    (position[2] - camPos.z) ** 2
                  );
                  return distance < 150; // culling
                })
                .map((planet, index) => (
                  <CustomPlanet
                    key={index}
                    {...planet}
                    onClick={() => handlePlanetClick(index)}
                  />
                ))}
            </>
          )}

          <CameraAnimator targetZ={cameraZ} />
        </Suspense>
      </Canvas>

      {exploreMode && selectedAltcoin && (
        <PlanetStoryCard
          name={selectedAltcoin.name}
          symbol={selectedAltcoin.symbol}
          description={altcoinDescriptions[selectedAltcoin.id]?.description || `Explore the wonders of ${selectedAltcoin.name}`}
          mission={`Discover the mission of ${selectedAltcoin.name}`}
          link={`https://www.coingecko.com/en/coins/${selectedAltcoin.id}`}
          onAbort={handleCloseInfo}
        />
      )}

      {exploreMode && (
        <button
          onClick={handleReturnToWebMode}
          className="fixed bottom-6 right-6 px-5 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition z-20 shadow"
        >
          🏠 Return to Web Mode
        </button>
      )}
    </div>
  );
}

function CameraAnimator({ targetZ }: { targetZ: number }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.z += (targetZ - camera.position.z) * 0.05;
  });
  return null;
}

function FallbackLoading() {
  return (
    <mesh>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="white" />
    </mesh>
  );
}
