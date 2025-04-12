// server/config/db.js
const mongoose = require('mongoose');

// MongoDB connection string
// For production, set this as an environment variable
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/stockvision';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoURI, {
      // These options are no longer needed in newer versions of mongoose
      // but included here for compatibility with older MongoDB versions
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;