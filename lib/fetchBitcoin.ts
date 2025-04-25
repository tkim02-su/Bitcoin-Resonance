export async function fetchBitcoinData() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin?localization=false');
    if (!res.ok) throw new Error('Failed to fetch BTC data');
    const json = await res.json();

    const price = json.market_data?.current_price?.usd ?? 0;
    const volume = json.market_data?.total_volume?.usd ?? 0;
    const change = json.market_data?.price_change_percentage_24h ?? 0;

    return { price, volume, change };
  } catch (err) {
    console.error('Fetch BTC Error:', err);
    return { price: 0, volume: 0, change: 0 };
  }
}
