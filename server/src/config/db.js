const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codealpha_project_management';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`[Database] MongoDB Connection Failed: ${err.message}`);
    console.error(`[Database] Please ensure MongoDB is running locally or specify MONGODB_URI in server/.env`);
    throw err;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[Database] MongoDB disconnected cleanly.');
  } catch (err) {
    console.error('[Database] Error during disconnect:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
