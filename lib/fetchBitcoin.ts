// app/lib/fetchBitcoin.ts

export async function fetchBitcoinData() {
  const res = await fetch('/api/bitcoin'); // ✅ 여기 수정!

  if (!res.ok) {
    throw new Error('Failed to fetch Bitcoin data from server');
  }

  const data = await res.json();

  return {
    price: data.price,          // ✅ 서버에서 이미 파싱된 데이터 받음
    volume: data.volume,
    change: data.change,
  };
}
