import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch("https://api.coincap.io/v2/assets/bitcoin", {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch from CoinCap:", res.status);
      return NextResponse.json({ error: "Failed to fetch from CoinCap" }, { status: 500 });
    }

    const data = await res.json();

    return NextResponse.json({
      price: parseFloat(data.data.priceUsd),
      volume: parseFloat(data.data.volumeUsd24Hr),
      change: parseFloat(data.data.changePercent24Hr),
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
