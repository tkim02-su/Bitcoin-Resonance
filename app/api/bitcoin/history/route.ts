// app/api/bitcoin/history/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily',
      {
        // Add headers to ensure we're identified properly to the API
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Bitcoin Resonance/1.0.0'
        },
        // Try with a longer timeout
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in Bitcoin history API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch Bitcoin historical data" },
      { status: 500 }
    );
  }
}