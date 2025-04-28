// lib/fetchAltcoins.ts

export interface Altcoin {
    id: string;
    symbol: string;
    name: string;
  }
  
  export async function fetchAltcoins(): Promise<Altcoin[]> {
    try {
      const res = await fetch('/api/altcoins');
      const data = await res.json();
  
      if (Array.isArray(data)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.slice(0, 200).map((coin: any) => ({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
        }));
      }
  
      return [];
    } catch (err) {
      console.error('Failed to fetch altcoins:', err);
      return [];
    }
  }
  