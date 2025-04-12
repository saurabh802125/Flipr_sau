
import React from 'react';
import { ArrowUpRight, ArrowDownRight, Star } from 'lucide-react';
import { Stock, StockService, WatchlistService } from '@/services/StockData';

interface StockCardProps {
  stock: Stock;
  onSelect?: (stock: Stock) => void;
  refreshWatchlist?: () => void;
}

const StockCard: React.FC<StockCardProps> = ({ 
  stock, 
  onSelect,
  refreshWatchlist
}) => {
  const isPositive = stock.change >= 0;
  const isInWatchlist = WatchlistService.isInWatchlist(stock.symbol);
  
  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isInWatchlist) {
      WatchlistService.removeFromWatchlist(stock.symbol);
    } else {
      WatchlistService.addToWatchlist(stock.symbol);
    }
    
    if (refreshWatchlist) {
      refreshWatchlist();
    }
  };
  
  return (
    <div 
      className="stock-card cursor-pointer transition-all duration-200 hover:shadow-lg"
      onClick={() => onSelect && onSelect(stock)}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">{stock.symbol}</h3>
            <button 
              onClick={handleWatchlistToggle}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <Star 
                className={`w-4 h-4 ${isInWatchlist ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} 
              />
            </button>
          </div>
          <p className="text-sm text-gray-600">{stock.name}</p>
        </div>
        
        <div className="text-right">
          <p className="text-lg font-bold">${stock.price.toFixed(2)}</p>
          <div className={`flex items-center text-sm ${isPositive ? 'text-stock-up' : 'text-stock-down'}`}>
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDownRight className="w-4 h-4 mr-1" />
            )}
            <span>{StockService.formatPriceChange(stock.change)}</span>
            <span className="ml-1">({StockService.formatPercentChange(stock.changePercent)})</span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex justify-between text-xs text-gray-500">
        <span>Market Cap: {StockService.formatMarketCap(stock.marketCap)}</span>
        <span>Sector: {stock.sector}</span>
      </div>
    </div>
  );
};

export default StockCard;
