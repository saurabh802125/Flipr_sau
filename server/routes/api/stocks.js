// server/routes/api/stocks.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const Stock = require('../../models/Stock');
const validateCSV = require('../../middleware/csvValidation');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.csv');
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function(req, file, cb) {
    // Accept only csv files
    if (!file.originalname.match(/\.(csv)$/)) {
      return cb(new Error('Only CSV files are allowed'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @route   GET api/stocks
// @desc    Get all stocks
// @access  Public
router.get('/', async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/stocks/:symbol
// @desc    Get stock by symbol
// @access  Public
router.get('/:symbol', async (req, res) => {
  try {
    const stock = await Stock.findOne({ symbol: req.params.symbol.toUpperCase() });
    
    if (!stock) {
      return res.status(404).json({ msg: 'Stock not found' });
    }
    
    res.json(stock);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/stocks/upload
// @desc    Upload and process CSV file
// @access  Public
router.post('/upload', upload.single('file'), validateCSV, async (req, res) => {
  try {
    // Process the CSV data (pre-validated by middleware)
    const processedData = processStockData(req.csvResults);
    
    // Save to database - using upsert to update existing or create new
    for (const stock of processedData) {
      await Stock.findOneAndUpdate(
        { symbol: stock.symbol },
        stock,
        { upsert: true, new: true }
      );
    }
    
    // Delete the uploaded file
    fs.unlinkSync(req.file.path);
    
    res.json({ msg: 'Stock data uploaded successfully', count: processedData.length });
  } catch (err) {
    console.error(err.message);
    
    // Delete the uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).send('Server Error');
  }
});

// Helper function to process CSV data
function processStockData(csvData) {
  const stockMap = {};
  
  csvData.forEach(row => {
    const symbol = (row.symbol || '').toUpperCase();
    if (!symbol) return;
    
    // Initialize stock if it doesn't exist
    if (!stockMap[symbol]) {
      stockMap[symbol] = {
        symbol,
        name: row.name || '',
        price: parseFloat(row.price) || 0,
        change: parseFloat(row.change) || 0,
        changePercent: parseFloat(row.changePercent) || 0,
        sector: row.sector || 'Unknown',
        marketCap: parseFloat(row.marketCap) || 0,
        prices: []
      };
    }
    
    // Add price data if available
    if (row.date) {
      stockMap[symbol].prices.push({
        date: row.date,
        open: parseFloat(row.open) || 0,
        high: parseFloat(row.high) || 0,
        close: parseFloat(row.close) || 0,
        low: parseFloat(row.low) || 0,
        volume: parseInt(row.volume) || 0
      });
    }
  });
  
  return Object.values(stockMap);
}

module.exports = router;