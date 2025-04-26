'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import EnhancedStars from './EnhancedStars';
import { OrbitControls as DreiOrbitControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import Planet from './Planet';
import * as THREE from 'three';
import { altcoinDescriptions } from '../../lib/altcoinDescriptions';

interface BitcoinUniverse3DProps {
  exploreMode: boolean;
  setExploreMode: (mode: boolean) => void;
}

interface AltcoinInfo {
  id: string;
  symbol: string;
  name: string;
}

export default function BitcoinUniverse3D({ exploreMode, setExploreMode }: BitcoinUniverse3DProps) {
  const [selectedAltcoin, setSelectedAltcoin] = useState<AltcoinInfo | null>(null);
  const [altcoins, setAltcoins] = useState<AltcoinInfo[]>([]);
  const [selectedPlanetPosition, setSelectedPlanetPosition] = useState<[number, number, number] | null>(null);
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);
  const cameraMoveProgress = useRef(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [initialExplorationDone, setInitialExplorationDone] = useState(false);

  useEffect(() => {
    const fetchAltcoins = async () => {
      try {
        const res = await fetch('/api/altcoins');
        const data = await res.json();
        if (Array.isArray(data)) {
          setAltcoins(data.slice(0, 100));
        } else {
          console.error('Unexpected altcoins API response:', data);
        }
      } catch (err) {
        console.error('Failed to fetch altcoins:', err);
      }
    };

    fetchAltcoins();
  }, []);

  useEffect(() => {
    if (exploreMode) {
      setIsAnimating(true);
      setInitialExplorationDone(false);
    }
  }, [exploreMode]);

  const handlePlanetClick = (altcoin: AltcoinInfo, position: [number, number, number]) => {
    setSelectedAltcoin(altcoin);
    setSelectedPlanetPosition(position);
    cameraMoveProgress.current = 0;
  };

  const handleCloseInfo = () => {
    setSelectedAltcoin(null);
    setSelectedPlanetPosition(null);
    cameraMoveProgress.current = 0;
  };

  const handleReturnToWebMode = () => {
    setIsReturning(true);
    setSelectedAltcoin(null);
    setSelectedPlanetPosition(null);
  };

  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={1} />
          <EnhancedStars exploreMode={exploreMode} />

          {exploreMode && (
            <>
              <DreiOrbitControls
                ref={orbitControlsRef}
                enableZoom={!isAnimating && !isReturning}
                enableRotate={!isAnimating && !isReturning}
                enablePan={!isAnimating && !isReturning}
                autoRotate={initialExplorationDone}
                autoRotateSpeed={0.2}
                zoomSpeed={0.3}
                rotateSpeed={0.2}
                panSpeed={0.3}
                minDistance={2}
                maxDistance={50}
                dampingFactor={0.1}
                enableDamping={true}
              />
              {Array.from({ length: 30 }).map((_, index) => {
                const randomAltcoin = altcoins[index % altcoins.length];
                const randomPosition: [number, number, number] = [
                  (Math.random() - 0.5) * 100,
                  (Math.random() - 0.5) * 100,
                  (Math.random() - 0.5) * 100,
                ];
                return (
                  <Planet
                    key={index}
                    position={randomPosition}
                    size={Math.random() * 1.5 + 0.5}
                    textureUrl={`/planet${(index % 8) + 1}.jpg`}
                    onClick={() => handlePlanetClick(randomAltcoin, randomPosition)}
                  />
                );
              })}
            </>
          )}
        </Suspense>

        {selectedPlanetPosition && (
          <CameraMover targetPosition={selectedPlanetPosition} progressRef={cameraMoveProgress} />
        )}

        {exploreMode && isAnimating && (
          <ExploreIntroAnimation onFinish={() => {
            setIsAnimating(false);
            setInitialExplorationDone(true);
          }} />
        )}

        {isReturning && <ReturnToWebAnimation onFinish={() => {
          setIsReturning(false);
          setExploreMode(false);
        }} />}
      </Canvas>

      {selectedAltcoin && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 p-8 rounded-lg shadow-lg border border-white max-w-md text-center z-20">
          <h2 className="text-3xl font-bold mb-4">{selectedAltcoin.name}</h2>
          <p className="text-sm text-gray-400 mb-2">Symbol: {selectedAltcoin.symbol.toUpperCase()}</p>
          <p className="text-gray-300 mb-6">
            {altcoinDescriptions[selectedAltcoin.id] || `Explore the wonders of ${selectedAltcoin.name}.`}
          </p>
          <a
            href={`https://www.coingecko.com/en/coins/${selectedAltcoin.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 px-6 py-2 bg-white text-black rounded-full hover:bg-gray-300 transition font-semibold"
          >
            Learn More
          </a>
          <button
            onClick={handleCloseInfo}
            className="block mt-4 px-6 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition mx-auto font-semibold"
          >
            Close
          </button>
        </div>
      )}

      {exploreMode && !isReturning && (
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

function CameraMover({ targetPosition, progressRef }: { targetPosition: [number, number, number]; progressRef: React.MutableRefObject<number>; }) {
  const targetVec = new THREE.Vector3(...targetPosition);

  useFrame(({ camera }) => {
    if (!targetPosition) return;

    progressRef.current += 0.005;
    if (progressRef.current > 1) progressRef.current = 1;

    const midPoint = new THREE.Vector3(
      (camera.position.x + targetVec.x) / 2,
      (camera.position.y + targetVec.y) / 2 + 10,
      (camera.position.z + targetVec.z) / 2
    );

    if (progressRef.current < 0.5) {
      camera.position.lerp(midPoint, progressRef.current * 2);
    } else {
      camera.position.lerp(targetVec.clone().add(new THREE.Vector3(0, 0, 5)), (progressRef.current - 0.5) * 2);
    }

    camera.lookAt(targetVec);
  });

  return null;
}

function ExploreIntroAnimation({ onFinish }: { onFinish: () => void; }) {
  const { camera } = useThree();
  const progress = useRef(0);

  useFrame(() => {
    progress.current += 0.004;
    if (progress.current >= 1) {
      onFinish();
    } else {
      const targetZ = 40;
      camera.position.z = THREE.MathUtils.lerp(5, targetZ, progress.current);
    }
  });

  return null;
}

function ReturnToWebAnimation({ onFinish }: { onFinish: () => void; }) {
  useFrame(({ camera }) => {
    const target = new THREE.Vector3(0, 0, 5);
    camera.position.lerp(target, 0.02);
    if (camera.position.distanceTo(target) < 0.1) {
      onFinish();
    }
  });
  return null;
}