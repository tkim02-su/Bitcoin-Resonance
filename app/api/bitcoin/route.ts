// app/api/bitcoin/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT', {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Binance data: ${res.status}`);
    }

    const data = await res.json();

    const price = parseFloat(data.lastPrice);
    const volume = parseFloat(data.quoteVolume); // USD volume
    const change = parseFloat(data.priceChangePercent);

    return NextResponse.json({ price, volume, change });
  } catch (error) {
    console.error('Proxy API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch Binance data' }, { status: 500 });
  }
}
