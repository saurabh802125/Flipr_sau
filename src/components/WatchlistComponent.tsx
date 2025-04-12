
import React, { useState, useEffect } from 'react';
import { Stock, WatchlistService } from '@/services/StockData';
import StockList from './StockList';
import { Pencil, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WatchlistProps {
  onSelectStock: (stock: Stock) => void;
}

const WatchlistComponent: React.FC<WatchlistProps> = ({ onSelectStock }) => {
  const [watchlistStocks, setWatchlistStocks] = useState<Stock[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  
  const loadWatchlist = () => {
    const stocks = WatchlistService.getWatchlistStocks();
    setWatchlistStocks(stocks);
  };
  
  useEffect(() => {
    loadWatchlist();
  }, []);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Watchlist</h2>
        
        <div>
          {isEditing ? (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(false)}
              >
                <Save className="w-4 h-4 mr-1" />
                Done
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </div>
      
      {watchlistStocks.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <p>Your watchlist is empty.</p>
          <p className="mt-2 text-sm">Add stocks to your watchlist by clicking the star icon on stock cards.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchlistStocks.map(stock => (
                <div key={stock.symbol} className="stock-card flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{stock.symbol}</h3>
                    <p className="text-sm text-gray-600">{stock.name}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      WatchlistService.removeFromWatchlist(stock.symbol);
                      loadWatchlist();
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <StockList 
              stocks={watchlistStocks} 
              title="" 
              onSelectStock={onSelectStock} 
              refreshWatchlist={loadWatchlist}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default WatchlistComponent;
