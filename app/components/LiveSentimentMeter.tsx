'use client';

import { useEffect, useState } from 'react';

export default function LiveSentimentMeter() {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await res.json();
        const price = data.bitcoin.usd;

        setPreviousPrice(currentPrice);
        setCurrentPrice(price);
      } catch (err) {
        console.error('LiveSentiment fetch error:', err);
      }
    };

    load();
    const interval = setInterval(load, 5000); // ✅ 3초 → 5초로 늘림
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
      <p className="text-5xl font-bold">{emoji}</p>
      <p className="text-lg">{sentiment}</p>
    </div>
  );
}
