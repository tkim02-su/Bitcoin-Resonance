'use client';

import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import EnhancedStars from './EnhancedStars';
import { OrbitControls as DreiOrbitControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import Planet from './Planet';
import { altcoinDescriptions } from '../../lib/altcoinDescriptions';
import PlanetStoryCard from './PlanetStoryCard';
import { TextureLoader } from 'three';
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

function MilkyWayBackground() {
  const texture = useLoader(TextureLoader, '/textures/milkyway.jpg');

  return (
    <mesh scale={[-500, 500, 500]}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

export default function BitcoinUniverse3D({ exploreMode, setExploreMode }: BitcoinUniverse3DProps) {
  const [selectedAltcoin, setSelectedAltcoin] = useState<AltcoinInfo | null>(null);
  const [altcoins, setAltcoins] = useState<AltcoinInfo[]>([]);
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);
  const [cameraZ, setCameraZ] = useState(5);

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
    } else {
      setCameraZ(5);
      setSelectedAltcoin(null);
    }
  }, [exploreMode]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePlanetClick = (altcoin: AltcoinInfo, _position: [number, number, number], _folder: string) => {
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
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Suspense fallback={null}>
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
                enablePan
                zoomSpeed={0.5}
                rotateSpeed={0.4}
                panSpeed={0.4}
                minDistance={2}
                maxDistance={50}
                dampingFactor={0.1}
                enableDamping
              />
              {Array.from({ length: 30 }).map((_, index) => {
                const randomAltcoin = altcoins[index % altcoins.length];
                const randomPosition: [number, number, number] = [
                  (Math.random() - 0.5) * 100,
                  (Math.random() - 0.5) * 100,
                  (Math.random() - 0.5) * 100,
                ];
                const planetFolder = `planet${(index % 32) + 1}`;
                return (
                  <Planet
                    key={index}
                    position={randomPosition}
                    size={Math.random() * 1.5 + 0.5}
                    planetFolder={planetFolder}
                    onClick={() => handlePlanetClick(randomAltcoin, randomPosition, planetFolder)}
                  />
                );
              })}
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
