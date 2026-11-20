const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialy';

  // 1. First, attempt to connect to an external MongoDB instance if available
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log(`✅ MongoDB Connected to external server: ${conn.connection.host}`);
    return;
  } catch (err) {
    console.log(`ℹ️  No external MongoDB detected. Initializing embedded persistent MongoDB on disk...`);
  }

  // 2. Fall back to embedded MongoDB with persistent disk storage in ./backend/data
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    mongod = await MongoMemoryServer.create({
      instance: {
        dbPath: dataDir,
        storageEngine: 'wiredTiger',
        dbName: 'socialy',
      },
    });

    const memoryUri = mongod.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`✅ MongoDB Connected with persistent disk storage at: ${dataDir}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
  process.exit(0);
});

module.exports = connectDB;
