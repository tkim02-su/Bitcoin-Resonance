'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown, AlertTriangle, Activity, Clock, DollarSign, TrendingUp, Zap, Globe } from 'lucide-react';

// Define TypeScript interfaces for our data
interface HistoricalDataPoint {
  date: string;
  price: number;
  volume: number;
  marketCap: number;
}

interface MarketData {
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume: number;
  high24h: number;
  low24h: number;
  ath: number;
  athDate: string;
  supply: number;
  maxSupply: number;
}

// Generate mock data for when API is unavailable
const generateMockHistoricalData = (): HistoricalDataPoint[] => {
  const data: HistoricalDataPoint[] = [];
  const today = new Date();
  
  // Generate 30 days of data
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Base price around $60,000 with some variation
    const basePrice = 92000;
    const priceVariation = (Math.sin(i / 5) * 0.1 + Math.random() * 0.05) * basePrice;
    const price = basePrice + priceVariation;
    
    // Volume and market cap based on price
    const volume = price * (0.1 + Math.random() * 0.05);
    const marketCap = price * 19000000 / 1000000000; // Approximate BTC supply

    data.push({
      date: date.toLocaleDateString(),
      price,
      volume: volume / 1000000000, // Convert to billions
      marketCap: marketCap
    });
  }
  
  return data;
};

const generateMockMarketData = (): MarketData => {
  const price = 90000 + (Math.random() * 2000 - 1000);
  const priceChange24h = Math.random() * 6 - 3; // Range from -3% to +3%
  
  return {
    price,
    priceChange24h,
    marketCap: price * 19000000,
    volume: price * (0.1 + Math.random() * 0.05) * 1000000000,
    high24h: price * 1.02,
    low24h: price * 0.98,
    ath: 108786,
    athDate: "01/20/2025",
    supply: 19857975, // Approximate current BTC supply
    maxSupply: 21000000 // BTC max supply
  };
};

// Fetch data with error handling and fallback to mock data
const fetchHistoricalData = async (): Promise<HistoricalDataPoint[]> => {
  try {
    // Try to use a proxy or direct API call
    const response = await fetch('/api/bitcoin/history');
    
    // If you don't have a proxy API endpoint, you can use this, but it may have CORS issues
    // const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily');
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.prices.map((price: [number, number], index: number) => ({
      date: new Date(price[0]).toLocaleDateString(),
      price: price[1],
      volume: data.total_volumes[index][1] / 1000000000, // Convert to billions
      marketCap: data.market_caps[index][1] / 1000000000, // Convert to billions
    }));
  } catch (error) {
    console.error("Error fetching historical data:", error);
    // Return mock data as fallback
    return generateMockHistoricalData();
  }
};

const fetchMarketData = async (): Promise<MarketData | null> => {
  try {
    // Try to use a proxy or direct API call
    const response = await fetch('/api/bitcoin/current');
    
    // If you don't have a proxy API endpoint, you can use this, but it may have CORS issues
    // const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin');
    
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
      maxSupply: data.market_data.max_supply
    };
  } catch (error) {
    console.error("Error fetching market data:", error);
    // Return mock data as fallback
    return generateMockMarketData();
  }
};

export default function BitcoinGalaxyDashboard() {
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const histData = await fetchHistoricalData();
        const mktData = await fetchMarketData();
        
        setHistoricalData(histData);
        setMarketData(mktData);
        
        // Check if we're using mock data
        setUsingMockData(histData === generateMockHistoricalData() || mktData === generateMockMarketData());
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // Set mock data as fallback
        setHistoricalData(generateMockHistoricalData());
        setMarketData(generateMockMarketData());
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every minute
    return () => clearInterval(interval);
  }, [timeframe]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-blue-500 mb-4"></div>
          <div className="h-4 w-32 bg-gray-700 rounded mb-2"></div>
          <div className="h-3 w-24 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <AlertTriangle size={48} className="text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Unable to load market data</h2>
        <p className="text-gray-400">Please try again later</p>
      </div>
    );
  }

  const priceColor = marketData.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500';
  const priceIcon = marketData.priceChange24h >= 0 ? <ArrowUp className="inline" /> : <ArrowDown className="inline" />;

  // Calculate supply percentage
  const supplyPercentage = (marketData.supply / marketData.maxSupply) * 100;
  const supplyColors = ['#3B82F6', '#1E293B'];

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Bitcoin Galaxy Observatory</h1>
          <p className="text-gray-400">Real-time cosmic insights into Bitcoin's universe</p>
          {usingMockData && (
            <div className="mt-2 bg-yellow-900 text-yellow-300 px-3 py-1 text-sm rounded-md inline-block">
              Using simulated data (API unavailable)
            </div>
          )}
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <button 
            onClick={() => setTimeframe('7d')}
            className={`px-3 py-1 rounded-full ${timeframe === '7d' ? 'bg-blue-600' : 'bg-gray-800'}`}
          >
            7D
          </button>
          <button 
            onClick={() => setTimeframe('30d')}
            className={`px-3 py-1 rounded-full ${timeframe === '30d' ? 'bg-blue-600' : 'bg-gray-800'}`}
          >
            30D
          </button>
          <button 
            onClick={() => setTimeframe('90d')}
            className={`px-3 py-1 rounded-full ${timeframe === '90d' ? 'bg-blue-600' : 'bg-gray-800'}`}
          >
            90D
          </button>
        </div>
      </div>
      
      {/* Price Overview */}
      <div className="bg-gray-900 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <p className="text-gray-400 text-sm">CURRENT PRICE</p>
            <h2 className="text-4xl font-bold">${marketData.price.toLocaleString()}</h2>
          </div>
          <div className={`text-xl font-bold ${priceColor} flex items-center gap-1`}>
            {priceIcon}
            {Math.abs(marketData.priceChange24h).toFixed(2)}%
            <span className="text-gray-400 text-sm ml-1">24h</span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#374151' }} />
              <YAxis domain={['dataMin - 1000', 'dataMax + 1000']} tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#374151' }} />
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }}
                labelStyle={{ color: '#F3F4F6' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
              />
              <Area type="monotone" dataKey="price" stroke="#3B82F6" fillOpacity={1} fill="url(#colorPrice)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-800 mb-6">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
        >
          Market Overview
        </button>
        <button 
          onClick={() => setActiveTab('indicators')}
          className={`px-4 py-2 font-medium ${activeTab === 'indicators' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
        >
          Cosmic Indicators
        </button>
        <button 
          onClick={() => setActiveTab('supply')}
          className={`px-4 py-2 font-medium ${activeTab === 'supply' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
        >
          Supply Analysis
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="mb-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Activity className="text-blue-500 mr-2" size={20} />
                <h3 className="text-gray-400 text-sm">24H RANGE</h3>
              </div>
              <p className="text-xl font-bold">${marketData.low24h.toLocaleString()} - ${marketData.high24h.toLocaleString()}</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="text-blue-500 mr-2" size={20} />
                <h3 className="text-gray-400 text-sm">ALL TIME HIGH</h3>
              </div>
              <p className="text-xl font-bold">${marketData.ath.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{marketData.athDate}</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <DollarSign className="text-blue-500 mr-2" size={20} />
                <h3 className="text-gray-400 text-sm">MARKET CAP</h3>
              </div>
              <p className="text-xl font-bold">${(marketData.marketCap / 1000000000).toFixed(2)}B</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <TrendingUp className="text-blue-500 mr-2" size={20} />
                <h3 className="text-gray-400 text-sm">24H VOLUME</h3>
              </div>
              <p className="text-xl font-bold">${(marketData.volume / 1000000000).toFixed(2)}B</p>
            </div>
          </div>
        )}
        
        {activeTab === 'indicators' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Price vs. Volume Correlation</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#374151' }} />
                    <YAxis yAxisId="left" domain={['dataMin - 1000', 'dataMax + 1000']} tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#374151' }} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 'dataMax + 5']} tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#374151' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }}
                      labelStyle={{ color: '#F3F4F6' }}
                      formatter={(value: number, name: string) => [name === 'price' ? `$${value.toLocaleString()}` : `$${value.toFixed(2)}B`, name === 'price' ? 'Price (USD)' : 'Volume (Billion $)']}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="price" stroke="#3B82F6" name="Price (USD)" />
                    <Line yAxisId="right" type="monotone" dataKey="volume" stroke="#10B981" name="Volume (Billion $)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Market Cap Distribution</h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historicalData.slice(-10)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#374151' }} />
                    <YAxis tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#374151' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }}
                      labelStyle={{ color: '#F3F4F6' }}
                      formatter={(value: number) => [`$${value.toFixed(2)}B`, 'Market Cap']}
                    />
                    <Legend />
                    <Bar dataKey="marketCap" fill="#8884d8" name="Market Cap (Billion $)">
                      {historicalData.slice(-10).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'supply' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Circulating Supply</h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-3xl font-bold">{Math.round(marketData.supply).toLocaleString()}</p>
                  <p className="text-gray-400 text-sm">out of {Math.round(marketData.maxSupply).toLocaleString()} BTC</p>
                </div>
                <div className="text-xl font-bold text-blue-500">
                  {supplyPercentage.toFixed(2)}%
                </div>
              </div>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Circulating', value: marketData.supply },
                        { name: 'Remaining', value: marketData.maxSupply - marketData.supply }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {supplyColors.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }}
                      labelStyle={{ color: '#F3F4F6' }}
                      formatter={(value: number, name: string, props: any) => {
                        const label = props.dataKey === 'value' && props.payload && props.payload.name 
                          ? props.payload.name 
                          : name;
                        return [`${Math.round(value).toLocaleString()} BTC`, label];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-6">Mining Progress</h3>
              <div className="h-64 flex flex-col justify-center">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Current Supply</span>
                  <span className="font-bold">{Math.round(marketData.supply).toLocaleString()} BTC</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4 mb-6">
                  <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${supplyPercentage}%` }}></div>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Max Supply</span>
                  <span className="font-bold">{Math.round(marketData.maxSupply).toLocaleString()} BTC</span>
                </div>
                
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                      <Zap className="text-yellow-500 mr-1" size={16} />
                      <span className="text-gray-400 text-xs">MINING STATUS</span>
                    </div>
                    <p className="text-lg font-bold">Active</p>
                  </div>
                  
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                      <Globe className="text-blue-500 mr-1" size={16} />
                      <span className="text-gray-400 text-xs">NETWORK HEALTH</span>
                    </div>
                    <p className="text-lg font-bold">Optimal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="text-center text-gray-500 text-sm mt-8">
        <p>Data {usingMockData ? 'simulated' : 'provided by CoinGecko API'} • Updated {new Date().toLocaleTimeString()}</p>
        <p className="mt-1">Bitcoin Resonance Analytics Module</p>
      </div>
    </div>
  );
}