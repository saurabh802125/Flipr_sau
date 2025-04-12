// server/scripts/seedDatabase.js
const mongoose = require('mongoose');
const Stock = require('../models/Stock');
const connectDB = require('../config/db');

// Connect to MongoDB
connectDB();

// Generate random historical prices
const generateHistoricalPrices = (basePrice, days = 30) => {
  const prices = [];
  let currentPrice = basePrice;
  
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Random price fluctuation between -3% and +3%
    const fluctuation = (Math.random() * 6 - 3) / 100;
    currentPrice = currentPrice * (1 + fluctuation);
    
    const open = currentPrice;
    const close = currentPrice * (1 + (Math.random() * 2 - 1) / 100);
    const high = Math.max(open, close) * (1 + Math.random() / 100);
    const low = Math.min(open, close) * (1 - Math.random() / 100);
    const volume = Math.floor(Math.random() * 10000000) + 500000;
    
    prices.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume
    });
  }
  
  return prices;
};

// Sample stock data
const stocksData = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 174.79,
    change: 1.23,
    changePercent: 0.71,
    sector: "Technology",
    marketCap: 2850000000000,
    prices: generateHistoricalPrices(174.79)
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 338.11,
    change: -2.45,
    changePercent: -0.72,
    sector: "Technology",
    marketCap: 2520000000000,
    prices: generateHistoricalPrices(338.11)
  },
  // More stock data here...
];

// Seed the database
const seedDatabase = async () => {
  try {
    // Delete all existing stocks
    await Stock.deleteMany({});
    console.log('Deleted all existing stocks');
    
    // Insert new stocks
    await Stock.insertMany(stocksData);
    console.log(`Successfully seeded ${stocksData.length} stocks to the database`);
    
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();