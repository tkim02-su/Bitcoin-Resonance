// app/components/MarketStats.tsx 
'use client';

interface MarketStatsProps {
  price: number;
  volume: number;
  change: number;
}

export default function MarketStats({ price, volume, change }: MarketStatsProps) {
  return (
    <div className="w-full flex justify-between px-16 mt-8 text-lg font-light">
      {/* Left - Price */}
      <div className="text-left">
        <p className="text-gray-400">Price</p>
        <p className="text-2xl">
          ${Number(price.toFixed(2)).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </p>
      </div>

      {/* Right - Volume & Change */}
      <div className="text-right">
        <p className="text-gray-400">Volume (24h)</p>
        <p className="text-2xl">
          ${Number(volume.toFixed(2)).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </p>
        <p className={
          change >= 0 ? 'text-green-400 mt-1' : 'text-red-400 mt-1'
        }>
          {change >= 0 ? '📈' : '📉'} {change.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}
