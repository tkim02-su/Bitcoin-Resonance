// app/components/TransactionFeed.tsx
'use client';

import { useEffect, useState } from 'react';
import TransactionCard from './TransactionCard';

interface Transaction {
  price: number;
  qty: number;
  side: string;
  time: number;
}

export default function TransactionFeed() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const transaction: Transaction = {
        price: parseFloat(data.p),
        qty: parseFloat(data.q),
        side: data.m ? 'sell' : 'buy',
        time: data.T,
      };

      setTransactions((prev) => [transaction, ...prev.slice(0, 14)]); // keep only latest 15
    };

    ws.onerror = (err) => console.error('Transaction WebSocket error:', err);
    ws.onclose = () => console.log('Transaction WebSocket closed');

    return () => ws.close();
  }, []);

  return (
    <div className="w-full max-w-md px-4 py-6 space-y-3 z-10 bg-black/70 border border-gray-700 rounded-lg shadow-lg mx-auto mt-10">
      <h2 className="text-xl font-semibold text-center mb-4 text-white">Live BTC Transactions</h2>
      {transactions.map((tx, index) => (
        <TransactionCard
          key={index}
          price={tx.price}
          quantity={tx.qty}
          side={tx.side as 'buy' | 'sell'}
          time={new Date(tx.time).toLocaleTimeString()}
        />
      ))}
    </div>
  );
}