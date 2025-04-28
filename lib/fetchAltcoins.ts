// lib/fetchAltcoins.ts
export async function fetchAltcoins(): Promise<any[]> {
    try {
      const res = await fetch('/api/altcoins');
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.slice(0, 200);
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch altcoins:', err);
      return [];
    }
  }
  