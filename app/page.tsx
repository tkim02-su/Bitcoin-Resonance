'use client';

import { useEffect, useState } from 'react';
import BreathingPanel from './components/BreathingPanel';
import MarketStats from './components/MarketStats';
import dynamic from 'next/dynamic';
import AboutSection from './components/AboutSection';
import { fetchBitcoinData } from '../lib/fetchBitcoin'; 
import FearGreedMeter from './components/FearGreedMeter';
import LiveSentimentMeter from './components/LiveSentimentMeter';



const BitcoinUniverse3D = dynamic(() => import('./components/BitcoinUniverse3D'), { ssr: false });

export default function Home() {
  const [btcData, setBtcData] = useState<{
    price: number;
    volume: number;
    change: number;
  } | null>(null);

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

    load(); // 최초 호출
    const interval = setInterval(load, 15000); // 15초마다 polling
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white overflow-x-hidden">
      <BitcoinUniverse3D />

      {btcData ? (
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

          <div className="mt-20">
            <AboutSection />
          </div>

          <div className="flex flex-col items-center justify-center space-y-10 mt-20">
            <FearGreedMeter />
            <LiveSentimentMeter />
          </div>
        </>
      ) : (
        <p className="text-gray-400 z-10">Loading Bitcoin data...</p>
      )}
    </main>
  );
}
