'use client';

import { useEffect, useState } from 'react';

export default function FearGreedMeter() {
  const [index, setIndex] = useState<number | null>(null);
  const [classification, setClassification] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('https://api.alternative.me/fng/');
        const data = await res.json();
        const value = parseInt(data.data[0].value);
        const classification = data.data[0].value_classification;

        setIndex(value);
        setClassification(classification);
      } catch (err) {
        console.error('FearGreed fetch error:', err);
      }
    };

    load();
    const interval = setInterval(load, 3600000); // 1시간마다 갱신
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md px-6 py-8 bg-black bg-opacity-60 rounded-xl text-center text-white space-y-4">
      <h2 className="text-2xl font-semibold">🌡️ Fear & Greed Index</h2>
      {index !== null ? (
        <>
          <p className="text-5xl font-bold">{index}</p>
          <p className="text-lg mt-2">{classification}</p>
        </>
      ) : (
        <p className="text-gray-400">Loading...</p>
      )}
    </div>
  );
}
