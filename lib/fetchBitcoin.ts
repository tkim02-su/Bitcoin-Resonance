// app/lib/fetchBitcoin.ts
export async function fetchBitcoinData() {
  const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
  const data = await res.json();

  const price = parseFloat(data.lastPrice);
  const volume = parseFloat(data.quoteVolume); // USD volume
  const change = parseFloat(data.priceChangePercent);

  return { price, volume, change };
}