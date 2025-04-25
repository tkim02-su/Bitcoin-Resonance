// app/api/bitcoin/route.ts
export async function GET() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin?localization=false');
    if (!res.ok) return new Response('Failed to fetch BTC data', { status: 500 });

    const json = await res.json();
    const price = json.market_data.current_price.usd;
    const volume = json.market_data.total_volume.usd;
    const change = json.market_data.price_change_percentage_24h;

    return Response.json({ price, volume, change });
  } catch {
    return new Response('Fetch error', { status: 500 });
  }
}
