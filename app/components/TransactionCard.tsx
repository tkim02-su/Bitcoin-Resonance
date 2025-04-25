// app/components/TransactionCard.tsx
'use client';

import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';

interface TransactionCardProps {
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  time: string;
}

export default function TransactionCard({ price, quantity, side, time }: TransactionCardProps) {
  return (
    <div
      className={`flex justify-between items-center px-4 py-2 rounded-md shadow-md transition duration-300 text-sm ${
        side === 'buy' ? 'bg-green-800/20 text-green-300' : 'bg-red-800/20 text-red-300'
      }`}
    >
      <div className="flex items-center space-x-2">
        {side === 'buy' ? (
          <ArrowTrendingUpIcon className="h-5 w-5 text-green-300" />
        ) : (
          <ArrowTrendingDownIcon className="h-5 w-5 text-red-300" />
        )}
        <span className="font-semibold">
          {side === 'buy' ? 'Buy' : 'Sell'} @ ${price.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>

      <div className="text-right">
        <p>{quantity.toFixed(4)} BTC</p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>
    </div>
  );
}
