'use client';

import { useEffect, useState } from 'react';
import BreathingPanel from './components/BreathingPanel';
import MarketStats from './components/MarketStats';
import dynamic from 'next/dynamic';
import AboutSection from './components/AboutSection';
import { fetchBitcoinData } from '../lib/fetchBitcoin';
import { fetchAltcoins } from '../lib/fetchAltcoins'; // ✅ added
import FearGreedMeter from './components/FearGreedMeter';
import LiveSentimentMeter from './components/LiveSentimentMeter';
import LoadingHeartbeat from './components/LoadingHeartbeat';
import Footer from './components/footer';
import BigBangIntro from './components/BigBangIntro';

const BitcoinUniverse3D = dynamic(() => import('./components/BitcoinUniverse3D'), { ssr: false });

export default function Home() {
  const [btcData, setBtcData] = useState<{
    price: number;
    volume: number;
    change: number;
  } | null>(null);

  const [altcoins, setAltcoins] = useState<any[]>([]); // ✅ new state
  const [isExploreMode, setIsExploreMode] = useState(false);
  const [introDone, setIntroDone] = useState(false); // ⭐ intro 끝났는지

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const data = await fetchBitcoinData();
        if (isMounted) setBtcData(data);
      } catch (err) {
        console.error('Polling fetch error:', err);
      }
    };

    const loadAltcoins = async () => {
      try {
        const data = await fetchAltcoins();
        if (isMounted) setAltcoins(data);
      } catch (err) {
        console.error('Altcoin fetch error:', err);
      }
    };

    load();
    loadAltcoins(); // ✅ fetch altcoins earlier too
    const interval = setInterval(load, 15000); // 15초마다 polling
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!introDone) {
    return <BigBangIntro onComplete={() => setIntroDone(true)} />;
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white overflow-x-hidden">
      <BitcoinUniverse3D exploreMode={isExploreMode} setExploreMode={setIsExploreMode} initialAltcoins={altcoins} /> {/* ✅ pass altcoins */}

      {!btcData ? (
        <LoadingHeartbeat />
      ) : (
        <>
          {!isExploreMode && (
            <>
              <h1 className="text-4xl font-bold mt-16 mb-6 z-10">Bitcoin Resonance</h1>

              <MarketStats
                price={btcData.price}
                volume={btcData.volume}
                change={btcData.change}
              />

              <BreathingPanel volume={btcData.volume} />

              <div className="mt-4 text-center text-lg space-y-1 z-10">
                <p>
                  Price: ${btcData.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p>
                  Volume: ${btcData.volume.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className={btcData.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                  Change: {btcData.change.toFixed(2)}%
                </p>
              </div>

              {/* 🔥 Explore Mode Button */}
              <button
                onClick={() => setIsExploreMode(true)}
                className="mt-10 px-6 py-3 bg-white text-black rounded-full hover:bg-gray-200 transition z-10 shadow"
              >
                🚀 Explore the Universe
              </button>

              <div className="mt-20">
                <AboutSection />
              </div>

              <div className="flex flex-col items-center justify-center space-y-10 mt-20">
                <FearGreedMeter />
                <LiveSentimentMeter />
              </div>

              {/* ✅ Footer: Explore Mode 아닐 때만 표시 */}
              <Footer />
            </>
          )}

          {/* 🔥 Web Mode 복귀 버튼 */}
          {isExploreMode && (
            <button
              onClick={() => setIsExploreMode(false)}
              className="fixed bottom-6 right-6 px-5 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition z-20 shadow"
            >
              🏠 Return to Web Mode
            </button>
          )}
        </>
      )}
    </main>
  );
}
