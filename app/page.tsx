'use client';

import { useEffect, useState } from 'react';
import BreathingPanel from './components/BreathingPanel';
import MarketStats from './components/MarketStats';
import dynamic from 'next/dynamic';
import AboutSection from './components/AboutSection';
import { fetchBitcoinData } from '../lib/fetchBitcoin';
import { fetchAltcoins, Altcoin } from '../lib/fetchAltcoins'; 
import FearGreedMeter from './components/FearGreedMeter';
import LiveSentimentMeter from './components/LiveSentimentMeter';
import LoadingHeartbeat from './components/LoadingHeartbeat';
import Footer from './components/footer';
import BigBangIntro from './components/BigBangIntro';

const BitcoinGalaxyDashboard = dynamic(() => import('./components/BitcoinGalaxyDashboard'), { ssr: false });
const BitcoinUniverse3D = dynamic(() => import('./components/BitcoinUniverse3D'), { ssr: false });

export default function Home() {
  const [btcData, setBtcData] = useState<{
    price: number;
    volume: number;
    change: number;
  } | null>(null);

  const [altcoins, setAltcoins] = useState<Altcoin[]>([]);
  const [isExploreMode, setIsExploreMode] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [hoverFeature, setHoverFeature] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async (): Promise<void> => {
      try {
        const data = await fetchBitcoinData();
        if (isMounted) setBtcData(data);
      } catch (err) {
        console.error('Polling fetch error:', err);
      }
    };

    const loadAltcoins = async (): Promise<void> => {
      try {
        const data = await fetchAltcoins();
        if (isMounted) setAltcoins(data);
      } catch (err) {
        console.error('Altcoin fetch error:', err);
      }
    };

    load();
    loadAltcoins();
    const interval = setInterval(load, 15000);
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
      <BitcoinUniverse3D exploreMode={isExploreMode} setExploreMode={setIsExploreMode} initialAltcoins={altcoins} />

      {!btcData ? (
        <LoadingHeartbeat />
      ) : (
        <>
          {/* Dashboard Overlay */}
          {showDashboard && !isExploreMode ? (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-40 overflow-auto">
              <BitcoinGalaxyDashboard />
              <button
                onClick={() => setShowDashboard(false)}
                className="fixed top-6 right-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full z-50 shadow-lg"
              >
                Close Dashboard
              </button>
            </div>
          ) : (
            !isExploreMode && (
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
                    Price: ${btcData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p>
                    Volume: ${btcData.volume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className={btcData.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                    Change: {btcData.change.toFixed(2)}%
                  </p>
                </div>

                {/* New Feature Navigation Section */}
                <div className="mt-16 w-full max-w-2xl relative z-10">
                  <h2 className="text-2xl font-bold text-center mb-6">Explore Bitcoin Resonance</h2>
                  
                  <div className="grid grid-cols-2 gap-6">
                    {/* Explore Universe Card */}
                    <div 
                      className={`relative overflow-hidden rounded-xl transition-all duration-500 cursor-pointer
                        ${hoverFeature === 'explore' ? 'scale-105 shadow-lg shadow-blue-500/30' : 'shadow-md'}
                        bg-gradient-to-br from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800`}
                      onMouseEnter={() => setHoverFeature('explore')}
                      onMouseLeave={() => setHoverFeature(null)}
                      onClick={() => setIsExploreMode(true)}
                    >
                      <div className="p-6 flex flex-col items-center text-center h-full">
                        <div className="text-4xl mb-3">🚀</div>
                        <h3 className="text-xl font-bold mb-3">Explore The Universe</h3>
                        <p className="text-blue-200 mb-4">Navigate through an immersive 3D visualization of Bitcoin and other cryptocurrencies</p>
                        <div
                          className="mt-auto w-full py-3 bg-white text-blue-900 rounded-lg hover:bg-blue-50 transition font-medium"
                        >
                          Launch Explorer
                        </div>
                      </div>
                      {/* Animated particle background */}
                      <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute w-24 h-24 bg-white rounded-full -top-12 -left-12 animate-pulse"></div>
                        <div className="absolute w-16 h-16 bg-blue-300 rounded-full bottom-0 right-0 animate-pulse" style={{ animationDelay: '1s' }}></div>
                      </div>
                    </div>

                    {/* Galaxy Analytics Card */}
                    <div 
                      className={`relative overflow-hidden rounded-xl transition-all duration-500 cursor-pointer
                        ${hoverFeature === 'analytics' ? 'scale-105 shadow-lg shadow-purple-500/30' : 'shadow-md'}
                        bg-gradient-to-br from-purple-900 to-blue-900 hover:from-purple-800 hover:to-blue-800`}
                      onMouseEnter={() => setHoverFeature('analytics')}
                      onMouseLeave={() => setHoverFeature(null)}
                      onClick={() => setShowDashboard(true)}
                    >
                      <div className="p-6 flex flex-col items-center text-center h-full">
                        <div className="text-4xl mb-3">📊</div>
                        <h3 className="text-xl font-bold mb-3">Galaxy Analytics</h3>
                        <p className="text-purple-200 mb-4">Dive deep into comprehensive Bitcoin market analytics and visualizations</p>
                        <div
                          className="mt-auto w-full py-3 bg-white text-purple-900 rounded-lg hover:bg-purple-50 transition font-medium"
                        >
                          View Analytics
                        </div>
                      </div>
                      {/* Animated chart-like background */}
                      <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute bottom-4 left-0 right-0 h-16">
                          <div className="absolute bottom-0 w-2 h-12 bg-white rounded-t-md left-6"></div>
                          <div className="absolute bottom-0 w-2 h-8 bg-white rounded-t-md left-12"></div>
                          <div className="absolute bottom-0 w-2 h-16 bg-white rounded-t-md left-18"></div>
                          <div className="absolute bottom-0 w-2 h-6 bg-white rounded-t-md left-24"></div>
                          <div className="absolute bottom-0 w-2 h-10 bg-white rounded-t-md left-30"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-20">
                  <AboutSection />
                </div>

                <div className="flex flex-col items-center justify-center space-y-10 mt-20">
                  <FearGreedMeter />
                  <LiveSentimentMeter />
                </div>

                <Footer />
              </>
            )
          )}

          {/* Return Button - Only in explore mode */}
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