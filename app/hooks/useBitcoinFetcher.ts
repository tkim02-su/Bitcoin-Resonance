'use client';

import { useEffect, useState } from 'react';

interface BitcoinData {
  price: number;
  volume: number;
  change: number;
}

export default function useBitcoinFetcher() {
  const [btcData, setBtcData] = useState<BitcoinData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/bitcoin');
        const json = await res.json();
        setBtcData(json);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // 10초 간격
    return () => clearInterval(interval);
  }, []);

  return btcData;
}
