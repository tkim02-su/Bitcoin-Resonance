// app/hooks/useBitcoinWebSocket.ts
'use client';

import { useEffect, useState } from 'react';

interface BitcoinData {
  price: number;
  volume: number;
  change: number;
}

export default function useBitcoinWebSocket() {
  const [btcData, setBtcData] = useState<BitcoinData | null>(null);

  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const price = parseFloat(data.c);
        const volumeBTC = parseFloat(data.v);
        const change = parseFloat(data.P);

        // BTC 거래량을 USD로 환산
        const volumeUSD = price * volumeBTC;

        setBtcData({
          price,
          volume: volumeUSD,
          change,
        });
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    };

    ws.onerror = (err) => console.error('WebSocket error:', err);
    ws.onclose = () => console.log('WebSocket connection closed');

    return () => ws.close();
  }, []);

  return btcData;
}
