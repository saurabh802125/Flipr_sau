import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MarketOverview from '@/components/MarketOverview';
import StockChart from '@/components/StockChart';
import StockList from '@/components/StockList';
import WatchlistComponent from '@/components/WatchlistComponent';
import StockSearch from '@/components/StockSearch';
import CSVUpload from '@/components/CSVUpload';
import { Stock, StockService } from '@/services/StockData';
import { ApiService } from '@/services/ApiService';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [allStocks, setAllStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [usingBackend, setUsingBackend] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadStocks = async () => {
      setIsLoading(true);
      try {
        // Check if backend is available
        const backendAvailable = await ApiService.backendAvailable();
        setUsingBackend(backendAvailable);
        
        let stocks: Stock[];
        if (backendAvailable) {
          // Load from API
          stocks = await ApiService.getAllStocks();
          toast({
            title: "Connected to backend",
            description: "Successfully connected to the backend server."
          });
        } else {
          // Load mock data
          stocks = StockService.getStocks();
          toast({
            title: "Using sample data",
            description: "Backend server not available. Using sample data instead.",
            variant: "destructive",
          });
        }
        
        setAllStocks(stocks);
        setFilteredStocks(stocks);
        
        // Set initial selected stock
        if (stocks.length > 0) {
          setSelectedStock(stocks[0]);
        }
      } catch (error) {
        console.error('Error loading stocks:', error);
        // Fallback to mock data
        const stocks = StockService.getStocks();
        setAllStocks(stocks);
        setFilteredStocks(stocks);
        
        // Set initial selected stock
        if (stocks.length > 0) {
          setSelectedStock(stocks[0]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStocks();
  }, [toast]);
  
  useEffect(() => {
    if (searchTerm) {
      const results = StockService.searchStocks(searchTerm);
      setFilteredStocks(results);
    } else {
      setFilteredStocks(allStocks);
    }
  }, [searchTerm, allStocks]);
  
  const handleStockSelect = async (stock: Stock) => {
    setSelectedStock(stock);
    
    // If using backend and the stock doesn't have price data, fetch it
    if (usingBackend && stock.prices.length === 0) {
      try {
        const fullStock = await ApiService.getStockBySymbol(stock.symbol);
        // Update the stock data with the full details including price history
        setSelectedStock(fullStock);
        
        // Also update it in the allStocks array
        setAllStocks(prev => prev.map(s => 
          s.symbol === fullStock.symbol ? fullStock : s
        ));
      } catch (error) {
        console.error(`Error fetching details for ${stock.symbol}:`, error);
      }
    }
    
    // Scroll to chart section for mobile users
    const chartSection = document.getElementById('chart-section');
    if (chartSection && window.innerWidth < 768) {
      chartSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };
  
  const refreshStocks = async () => {
    if (usingBackend) {
      try {
        setIsLoading(true);
        const stocks = await ApiService.getAllStocks();
        setAllStocks(stocks);
        setFilteredStocks(stocks);
        
        toast({
          title: "Data refreshed",
          description: "Stock data has been refreshed from the server."
        });
      } catch (error) {
        console.error('Error refreshing stocks:', error);
        toast({
          title: "Refresh failed",
          description: "Failed to refresh stock data from the server.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <section className="mb-8">
              <MarketOverview stocks={allStocks} onSelectStock={handleStockSelect} />
            </section>
            
            <section id="chart-section" className="mb-8">
              {selectedStock && <StockChart stock={selectedStock} />}
            </section>
            
            <section className="mb-8">
              <CSVUpload onUploadSuccess={refreshStocks} />
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
          </>
        )}
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
              <p>
                {usingBackend 
                  ? "Connected to backend server" 
                  : "Using sample data for demonstration purposes"}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;