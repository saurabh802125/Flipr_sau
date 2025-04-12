// src/services/ApiService.ts
import axios from 'axios';
import { Stock, stocksData } from './StockData';

// API base URL - change this to your production URL when deploying
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance for API calls
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ApiService = {
  // Check if backend is available
  backendAvailable: async (): Promise<boolean> => {
    try {
      await api.get('/stocks');
      return true;
    } catch (error) {
      console.warn('Backend not available, using mock data');
      return false;
    }
  },
  // Get all stocks
  getAllStocks: async (): Promise<Stock[]> => {
    try {
      const response = await api.get('/stocks');
      return response.data;
    } catch (error) {
      console.error('Error fetching stocks:', error);
      throw error;
    }
  },

  // Get stock by symbol
  getStockBySymbol: async (symbol: string): Promise<Stock> => {
    try {
      const response = await api.get(`/stocks/${symbol}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stock ${symbol}:`, error);
      throw error;
    }
  },

  // Upload CSV file
  uploadCSV: async (file: File): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_BASE_URL}/stocks/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading CSV:', error);
      throw error;
    }
  },
  
  // Additional API methods can be added here as needed
};