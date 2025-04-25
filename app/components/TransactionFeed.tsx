'use client';

import { useEffect, useState } from 'react';
import TransactionCard from './TransactionCard';

interface Transaction {
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  time: number;
}

export default function TransactionFeed() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/transactions');
        if (!res.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const data = await res.json();

        if (Array.isArray(data)) {
          setTransactions(data);
        } else {
          console.error('Invalid transaction data:', data);
          setTransactions([]); // fallback to empty
        }
      } catch (err) {
        console.error('Transaction polling error:', err);
        setTransactions([]); // fallback to empty
      }
    };

    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md px-4 py-6 space-y-3 z-10">
      <h2 className="text-xl font-semibold text-center mb-4">Live BTC Transactions</h2>
      {transactions.map((tx, index) => (
        <TransactionCard
          key={index}
          price={tx.price}
          quantity={tx.quantity}
          side={tx.side}
          time={new Date(tx.time).toLocaleTimeString()}
        />
      ))}
    </div>
  );
}
