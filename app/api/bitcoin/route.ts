import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true", {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 10 }, // ⭐️ Next.js 14 이상에서 필요한 설정
    });

    if (!res.ok) {
      console.error("Failed to fetch from Coingecko:", res.status);
      return NextResponse.json({ error: "Failed to fetch from Coingecko" }, { status: 500 });
    }

    const data = await res.json();

    if (!data.bitcoin) {
      console.error("Invalid response structure from Coingecko");
      return NextResponse.json({ error: "Invalid response from Coingecko" }, { status: 500 });
    }

    return NextResponse.json({
      price: data.bitcoin.usd,
      volume: data.bitcoin.usd_24h_vol,
      change: data.bitcoin.usd_24h_change,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
