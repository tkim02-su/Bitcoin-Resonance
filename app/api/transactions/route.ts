// app/api/transactions/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api.binance.com/api/v3/trades?symbol=BTCUSDT&limit=15', {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Binance trades: ${res.status}`);
    }

    const data = await res.json();

    const mapped = data.map((trade: any) => ({
      price: parseFloat(trade.price),
      quantity: parseFloat(trade.qty),
      side: trade.isBuyerMaker ? 'sell' : 'buy',
      time: trade.time,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Transaction Proxy API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch Binance trades' }, { status: 500 });
  }
}
