// app/lib/fetchBitcoin.ts

export async function fetchBitcoinData() {
  const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true');
  
  if (!res.ok) {
    throw new Error('Failed to fetch Bitcoin data from CoinGecko');
  }

  const data = await res.json();

  return {
    price: data.bitcoin.usd,                 // 현재 가격
    volume: data.bitcoin.usd_24h_vol,         // 24시간 거래량 (USD)
    change: data.bitcoin.usd_24h_change,      // 24시간 변동률 (%)
  };
}
