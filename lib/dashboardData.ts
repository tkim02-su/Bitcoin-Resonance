'use client';

// lib/dashboardData.ts

/**
 * Utility functions for fetching cryptocurrency data for the dashboard
 */

// Function to fetch historical price data for Bitcoin
export async function fetchHistoricalData(days = 30) {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}&interval=daily`
    );
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Format the data for our charts
    return data.prices.map((price: [number, number], index: number) => ({
      date: new Date(price[0]).toLocaleDateString(),
      price: price[1],
      volume: data.total_volumes[index][1] / 1000000000, // Convert to billions
      marketCap: data.market_caps[index][1] / 1000000000, // Convert to billions
    }));
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return [];
  }
}

// Function to fetch current market data for Bitcoin
export async function fetchMarketData() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/bitcoin'
    );
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      price: data.market_data.current_price.usd,
      priceChange24h: data.market_data.price_change_percentage_24h,
      marketCap: data.market_data.market_cap.usd,
      volume: data.market_data.total_volume.usd,
      high24h: data.market_data.high_24h.usd,
      low24h: data.market_data.low_24h.usd,
      ath: data.market_data.ath.usd,
      athDate: new Date(data.market_data.ath_date.usd).toLocaleDateString(),
      supply: data.market_data.circulating_supply,
      maxSupply: data.market_data.max_supply,
      // Additional data you might want to use:
      marketCapRank: data.market_cap_rank,
      totalSupply: data.market_data.total_supply,
      hashRate: null, // Not available in CoinGecko API
      lastUpdated: new Date(data.last_updated).toLocaleString()
    };
  } catch (error) {
    console.error("Error fetching market data:", error);
    return null;
  }
}

// Function to fetch fear and greed index (note: this would require a different API)
export async function fetchFearGreedIndex() {
  try {
    // This is a placeholder - you would need to find a free API that provides this data
    // For example: Alternative.me API or Crypto Fear & Greed Index API
    return {
      value: 65, // Sample value between 0-100
      classification: "Greed",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error fetching fear & greed index:", error);
    return null;
  }
}

// Function to fetch top cryptocurrencies for comparison
export async function fetchTopCryptos(limit = 10) {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`
    );
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching top cryptocurrencies:", error);
    return [];
  }
}

// Helper function to throttle API requests (to avoid hitting rate limits)
// eslint-disable-next-line @typescript-eslint/ban-types
export function throttledFetch(fetchFn: Function, interval = 60000) {
  let lastFetchTime = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cachedResult: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async function(...args: any[]) {
    const now = Date.now();
    if (now - lastFetchTime > interval || cachedResult === null) {
      try {
        cachedResult = await fetchFn(...args);
        lastFetchTime = now;
      } catch (error) {
        console.error("Error in throttled fetch:", error);
        // Return cached result if available, otherwise rethrow
        if (cachedResult === null) throw error;
      }
    }
    
    return cachedResult;
  };
}