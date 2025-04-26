'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import EnhancedStars from './EnhancedStars';
import { OrbitControls } from '@react-three/drei';
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; // ✅ 추가!
import Planet from './Planet';

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
  const [loading, setLoading] = useState(false);

  const controlsRef = useRef<ThreeOrbitControls>(null); // ✅ 타입 제대로 수정

  useEffect(() => {
    const fetchAltcoins = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/altcoins');
        const data = await res.json();
        if (Array.isArray(data)) {
          const mockData = data.slice(0, 6).map((coin, idx) => ({
            ...coin,
            image: `/planet${(idx % 6) + 1}.jpg`, // 너가 public 폴더에 넣은 이미지
            description: `A fascinating planet called ${coin.name}, full of mysteries and wonders.`,
          }));
          setAltcoins(mockData);
        } else {
          console.error('Unexpected altcoins API response:', data);
        }
      } catch (err) {
        console.error('Failed to fetch altcoins:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAltcoins();
  }, []);

  const handlePlanetClick = (planetPosition: [number, number, number], altcoin: AltcoinInfo) => {
    // 카메라 이동
    if (controlsRef.current) {
      controlsRef.current.target.set(...planetPosition);
    }
    setSelectedAltcoin(altcoin);
  };

  const handleClose = () => {
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0); // 중앙으로 복귀
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

      {/* 인포 카드 */}
      {selectedAltcoin && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 p-8 rounded-lg shadow-lg border border-white max-w-md text-center z-20 animate-fadeIn">
          {/* 코인 이미지 */}
          <img
            src={selectedAltcoin.image}
            alt={selectedAltcoin.name}
            className="w-24 h-24 mx-auto rounded-full mb-4 shadow-lg object-cover"
          />
          {/* 코인 이름 */}
          <h2 className="text-3xl font-bold mb-2">{selectedAltcoin.name}</h2>
          {/* 심볼 */}
          <p className="text-gray-300 text-sm mb-4">Symbol: {selectedAltcoin.symbol.toUpperCase()}</p>
          {/* 설명 */}
          <p className="text-gray-400 mb-6">
            {selectedAltcoin.description}
          </p>
          {/* 버튼 */}
          <a
            href={`https://www.coingecko.com/en/coins/${selectedAltcoin.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 px-6 py-3 bg-white text-black rounded-full hover:bg-gray-300 transition font-semibold"
          >
            Learn More
          </a>
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
