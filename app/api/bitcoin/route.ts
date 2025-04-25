// app/api/bitcoin/route.ts
export async function GET() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true");

    if (!res.ok) {
      console.error("Failed to fetch from Coingecko:", res.status);
      return new Response(JSON.stringify({ error: "Failed to fetch from Coingecko" }), { status: 500 });
    }

    const data = await res.json();

    return Response.json({
      price: data.bitcoin.usd,
      volume: data.bitcoin.usd_24h_vol,
      change: data.bitcoin.usd_24h_change,
    });
  } catch (err) {
    console.error("API error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
