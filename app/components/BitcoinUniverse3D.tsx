'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import EnhancedStars from './EnhancedStars';
import { OrbitControls } from '@react-three/drei';
import Planet from './Planet';

interface BitcoinUniverse3DProps {
  exploreMode: boolean;
}

interface AltcoinInfo {
  id: string;
  symbol: string;
  name: string;
}

interface PlanetData {
  position: [number, number, number];
  size: number;
  altcoin: AltcoinInfo;
  imagePath: string; // ⭐️ imagePath 추가
}

export default function BitcoinUniverse3D({ exploreMode }: BitcoinUniverse3DProps) {
  const [selectedAltcoin, setSelectedAltcoin] = useState<AltcoinInfo | null>(null);
  const [planets, setPlanets] = useState<PlanetData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAltcoins = async () => {
      try {
        const res = await fetch('/api/altcoins');
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error('Invalid altcoin data:', data);
          setLoading(false);
          return;
        }

        const shuffled = data.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 30); // 최대 30개

        const generatedPlanets = selected.map((altcoin: AltcoinInfo, index: number) => ({
          position: [
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200,
          ] as [number, number, number],
          size: Math.random() * 4 + 2,
          altcoin,
          imagePath: `planet#${(index % 30) + 1}.png`, // ⭐️ planet1.jpg ~ planet30.jpg 순환
        }));

        setPlanets(generatedPlanets);
      } catch (err) {
        console.error('Failed to fetch altcoins:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAltcoins();
  }, []);

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
                enableZoom={true}
                zoomSpeed={0.5}
                rotateSpeed={0.4}
                panSpeed={0.4}
                minDistance={2}
                maxDistance={500}
                dampingFactor={0.1}
                enableDamping={true}
              />

              {/* planets 로딩 끝났을 때만 렌더링 */}
              {planets.length > 0 && planets.map((planet, index) => (
                <Planet
                  key={index}
                  position={planet.position}
                  size={planet.size}
                  imagePath={planet.imagePath} // ⭐️ 여기
                  onClick={() => setSelectedAltcoin(planet.altcoin)}
                />
              ))}
            </>
          )}
        </Suspense>
      </Canvas>

      {/* 로딩 중 표시 */}
      {loading && exploreMode && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xl z-20">
          Loading Universe...
        </div>
      )}

      {selectedAltcoin && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 p-6 rounded-lg shadow-lg border border-white max-w-md text-center z-20">
          <h2 className="text-2xl font-bold mb-2">
            {selectedAltcoin.name} ({selectedAltcoin.symbol.toUpperCase()})
          </h2>
          <p className="text-gray-300">Explore {selectedAltcoin.name} on Coingecko!</p>
          <a
            href={`https://www.coingecko.com/en/coins/${selectedAltcoin.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 px-4 py-2 bg-white text-black rounded-full hover:bg-gray-300 transition"
          >
            View Details
          </a>
          <button
            className="block mt-4 px-4 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition mx-auto"
            onClick={() => setSelectedAltcoin(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
