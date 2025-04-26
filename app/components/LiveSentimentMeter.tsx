'use client';

import { useEffect, useState } from 'react';

export default function LiveSentimentMeter() {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/bitcoin'); // ✅ Coingecko 직접 호출 X
        const data = await res.json();

        if (data?.price) {
          const price = data.price;
          setPreviousPrice(currentPrice);
          setCurrentPrice(price);
        } else {
          console.error('Invalid bitcoin price data:', data);
        }
      } catch (err) {
        console.error('LiveSentiment fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 5000); // 5초마다 가격 polling
    return () => clearInterval(interval);
  }, [currentPrice]);

  let sentiment = 'Loading...';
  let emoji = '⏳';

  if (currentPrice !== null && previousPrice !== null) {
    if (currentPrice > previousPrice) {
      sentiment = '🚀 Bullish';
      emoji = '🚀';
    } else if (currentPrice < previousPrice) {
      sentiment = '😰 Bearish';
      emoji = '😰';
    } else {
      sentiment = '😐 Neutral';
      emoji = '😐';
    }
  }

  return (
    <div className="w-full max-w-md px-6 py-8 bg-black bg-opacity-60 rounded-xl text-center text-white space-y-4">
      <h2 className="text-2xl font-semibold">⚡ Live Sentiment</h2>

      {loading ? (
        <p className="text-xl">Loading...</p> // ⭐️ 로딩 중 표시
      ) : (
        <>
          <p className="text-5xl font-bold">{emoji}</p>
          <p className="text-lg">{sentiment}</p>
          <p className="text-sm text-gray-400">
            {currentPrice !== null ? `$${currentPrice.toLocaleString()}` : ''}
          </p>
        </>
      )}
    </div>
  );
}
