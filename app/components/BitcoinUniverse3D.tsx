'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import EnhancedStars from './EnhancedStars';
import { OrbitControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import Planet from './Planet';
import * as THREE from 'three';

interface BitcoinUniverse3DProps {
  exploreMode: boolean;
}

interface AltcoinInfo {
  id: string;
  symbol: string;
  name: string;
}

export default function BitcoinUniverse3D({ exploreMode }: BitcoinUniverse3DProps) {
  const [selectedAltcoin, setSelectedAltcoin] = useState<AltcoinInfo | null>(null);
  const [altcoins, setAltcoins] = useState<AltcoinInfo[]>([]);
  const [selectedPlanetPosition, setSelectedPlanetPosition] = useState<[number, number, number] | null>(null);
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);

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

  const handlePlanetClick = (altcoin: AltcoinInfo, position: [number, number, number]) => {
    setSelectedAltcoin(altcoin);
    setSelectedPlanetPosition(position);
  };

  const handleCloseInfo = () => {
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
              <OrbitControls
                ref={orbitControlsRef}
                enableZoom={true}
                zoomSpeed={0.5}
                rotateSpeed={0.4}
                panSpeed={0.4}
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
                    textureUrl={`/planet${(index % 6) + 1}.jpg`}
                    onClick={() => handlePlanetClick(randomAltcoin, randomPosition)}
                  />
                );
              })}
            </>
          )}
        </Suspense>

        {selectedPlanetPosition && (
          <CameraMover targetPosition={selectedPlanetPosition} />
        )}
      </Canvas>

      {selectedAltcoin && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 p-8 rounded-lg shadow-lg border border-white max-w-md text-center z-20">
          <h2 className="text-3xl font-bold mb-4">{selectedAltcoin.name}</h2>
          <p className="text-sm text-gray-400 mb-2">Symbol: {selectedAltcoin.symbol.toUpperCase()}</p>
          <p className="text-gray-300 mb-6">
            Discover the mysteries of {selectedAltcoin.name}. This planet holds secrets beyond imagination.
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
    </div>
  );
}

function CameraMover({ targetPosition }: { targetPosition: [number, number, number] }) {
  const targetVec = new THREE.Vector3(...targetPosition);

  useFrame(({ camera }) => {
    camera.position.lerp(targetVec.clone().add(new THREE.Vector3(0, 0, 5)), 0.05);
    camera.lookAt(targetVec);
  });

  return null;
}
