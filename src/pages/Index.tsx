
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MarketOverview from '@/components/MarketOverview';
import StockChart from '@/components/StockChart';
import StockList from '@/components/StockList';
import WatchlistComponent from '@/components/WatchlistComponent';
import StockSearch from '@/components/StockSearch';
import { Stock, StockService } from '@/services/StockData';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [allStocks, setAllStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Load stocks data
    const stocks = StockService.getStocks();
    setAllStocks(stocks);
    setFilteredStocks(stocks);
    
    // Set initial selected stock
    if (stocks.length > 0) {
      setSelectedStock(stocks[0]);
    }
  }, []);
  
  useEffect(() => {
    if (searchTerm) {
      const results = StockService.searchStocks(searchTerm);
      setFilteredStocks(results);
    } else {
      setFilteredStocks(allStocks);
    }
  }, [searchTerm, allStocks]);
  
  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
    
    // Scroll to chart section for mobile users
    const chartSection = document.getElementById('chart-section');
    if (chartSection && window.innerWidth < 768) {
      chartSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };
  
  const handleAddToWatchlist = (stock: Stock) => {
    const isInWatchlist = localStorage.getItem('watchlist')
      ? JSON.parse(localStorage.getItem('watchlist') || '[]').includes(stock.symbol)
      : false;
      
    if (!isInWatchlist) {
      const watchlist = localStorage.getItem('watchlist')
        ? JSON.parse(localStorage.getItem('watchlist') || '[]')
        : [];
        
      watchlist.push(stock.symbol);
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
      
      toast({
        title: "Added to watchlist",
        description: `${stock.symbol} has been added to your watchlist.`,
      });
    } else {
      toast({
        title: "Already in watchlist",
        description: `${stock.symbol} is already in your watchlist.`,
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="mb-8">
          <MarketOverview stocks={allStocks} onSelectStock={handleStockSelect} />
        </section>
        
        <section id="chart-section" className="mb-8">
          {selectedStock && <StockChart stock={selectedStock} />}
        </section>
        
        <section id="watchlist" className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Watchlist</h2>
          <WatchlistComponent onSelectStock={handleStockSelect} />
        </section>
        
        <section id="stocks" className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Discover Stocks</h2>
          <StockSearch 
            stocks={allStocks}
            onFilteredStocks={setFilteredStocks}
          />
          <StockList 
            stocks={filteredStocks} 
            title="All Stocks" 
            onSelectStock={handleStockSelect}
            refreshWatchlist={() => {
              // This will trigger the watchlist component to reload
              const event = new CustomEvent('watchlist-changed');
              window.dispatchEvent(event);
            }}
          />
        </section>
      </main>
      
      <footer className="bg-stock-blue-dark text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">StockVision</h2>
              <p className="text-sm text-gray-300">Dynamic stock market analysis</p>
            </div>
            <div className="text-sm text-gray-300">
              <p>© 2025 StockVision. All rights reserved.</p>
              <p>Using sample data for demonstration purposes.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
