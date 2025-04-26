// app/api/altcoins/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false', {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 } // (선택) 1시간 캐싱
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch altcoins' }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch altcoins:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
