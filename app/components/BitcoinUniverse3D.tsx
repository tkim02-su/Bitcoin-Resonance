'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import { OrbitControls } from '@react-three/drei';
import { OrbitControls as ThreeOrbitControls } from 'three-stdlib'; // ✅ 타입용 import
import EnhancedStars from './EnhancedStars';
import Planet from './Planet';
import Image from 'next/image';

interface BitcoinUniverse3DProps {
  exploreMode: boolean;
}

interface AltcoinInfo {
  id: string;
  symbol: string;
  name: string;
  image: string;
  description: string;
}

export default function BitcoinUniverse3D({ exploreMode }: BitcoinUniverse3DProps) {
  const [selectedAltcoin, setSelectedAltcoin] = useState<AltcoinInfo | null>(null);
  const [altcoins, setAltcoins] = useState<AltcoinInfo[]>([]);
  const controlsRef = useRef<ThreeOrbitControls>(null); // ✅ 타입 정확히 수정

  useEffect(() => {
    const fetchAltcoins = async () => {
      try {
        const res = await fetch('/api/altcoins');
        const data = await res.json();
        if (Array.isArray(data)) {
          const mockData = data.slice(0, 6).map((coin, idx) => ({
            ...coin,
            image: `/planet${(idx % 6) + 1}.jpg`, // Public 폴더에 planet1~6.jpg 준비
            description: `A fascinating planet called ${coin.name}, full of mysteries and wonders.`,
          }));
          setAltcoins(mockData);
        } else {
          console.error('Unexpected altcoins API response:', data);
        }
      } catch (err) {
        console.error('Failed to fetch altcoins:', err);
      }
    };

    fetchAltcoins();
  }, []);

  const handlePlanetClick = (planetPosition: [number, number, number], altcoin: AltcoinInfo) => {
    if (controlsRef.current) {
      controlsRef.current.target.set(...planetPosition);
    }
    setSelectedAltcoin(altcoin);
  };

  const handleClose = () => {
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
    }
    setSelectedAltcoin(null);
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
                ref={controlsRef}
                enableZoom
                zoomSpeed={0.5}
                rotateSpeed={0.4}
                panSpeed={0.4}
                minDistance={2}
                maxDistance={50}
                dampingFactor={0.1}
                enableDamping
              />
              {Array.from({ length: 30 }).map((_, index) => {
                const altcoin = altcoins[index % altcoins.length];
                return (
                  <Planet
                    key={index}
                    position={[
                      (Math.random() - 0.5) * 100,
                      (Math.random() - 0.5) * 100,
                      (Math.random() - 0.5) * 100,
                    ]}
                    size={Math.random() * 1.5 + 0.5}
                    textureUrl={altcoin?.image || '/planet1.jpg'}
                    onClick={(planetPosition) => handlePlanetClick(planetPosition, altcoin)}
                  />
                );
              })}
            </>
          )}
        </Suspense>
      </Canvas>

      {selectedAltcoin && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 p-8 rounded-lg shadow-lg border border-white max-w-md text-center z-20 animate-fadeIn">
          {/* ⭐ 코인 이미지 */}
          <Image
            src={selectedAltcoin.image}
            alt={selectedAltcoin.name}
            width={96}
            height={96}
            className="rounded-full mb-4 shadow-lg object-cover mx-auto"
            unoptimized // ✅ public 폴더 이미지라 unoptimized 추가
          />

          {/* 코인 이름 */}
          <h2 className="text-3xl font-bold mb-2">{selectedAltcoin.name}</h2>

          {/* 심볼 */}
          <p className="text-gray-300 text-sm mb-4">Symbol: {selectedAltcoin.symbol.toUpperCase()}</p>

          {/* 설명 */}
          <p className="text-gray-400 mb-6">
            {selectedAltcoin.description}
          </p>

          {/* Learn More 버튼 */}
          <a
            href={`https://www.coingecko.com/en/coins/${selectedAltcoin.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 px-6 py-3 bg-white text-black rounded-full hover:bg-gray-300 transition font-semibold"
          >
            Learn More
          </a>

          {/* Close 버튼 */}
          <button
            className="block mt-4 px-6 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition mx-auto font-semibold"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
