'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import EnhancedStars from './EnhancedStars';
import { OrbitControls as DreiOrbitControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import Planet from './Planet';
import * as THREE from 'three';
import { altcoinDescriptions } from '../../lib/altcoinDescriptions';
import PlanetStoryCard from './PlanetStoryCard';

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
  const [selectedPlanetFolder, setSelectedPlanetFolder] = useState<string>('');
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);
  const [isReturning, setIsReturning] = useState(false);
  const [cameraZ, setCameraZ] = useState(5); // 🚀 초기 카메라 위치

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
      // Explore 모드 들어가면 카메라 천천히 zoom out
      setCameraZ(20); 
    } else {
      // Web 모드 복귀하면 카메라 원위치
      setCameraZ(5);
      setSelectedAltcoin(null); // ✅ StoryCard도 제거
    }
  }, [exploreMode]);

  const handlePlanetClick = (altcoin: AltcoinInfo, position: [number, number, number], folder: string) => {
    setSelectedAltcoin(altcoin);
    setSelectedPlanetPosition(position);
    setSelectedPlanetFolder(folder);
  };

  const handleCloseInfo = () => {
    setSelectedAltcoin(null);
    setSelectedPlanetPosition(null);
    setSelectedPlanetFolder('');
  };

  const handleReturnToWebMode = () => {
    setIsReturning(true);
    setExploreMode(false);
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
                ref={orbitControlsRef as any}
                enableZoom={true}
                enableRotate={true}
                enablePan={true}
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
                const planetFolder = `planet${(index % 5) + 1}`;
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

          {/* 카메라 움직임 부드럽게 */}
          <CameraAnimator targetZ={cameraZ} />
        </Suspense>
      </Canvas>

      {/* PlanetStoryCard는 Explore Mode에서만 보여야 함 */}
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

// 🎥 부드러운 카메라 애니메이터 컴포넌트
function CameraAnimator({ targetZ }: { targetZ: number }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.z += (targetZ - camera.position.z) * 0.05; // 부드럽게 이동
  });
  return null;
}