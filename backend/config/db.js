import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

let mongoMemoryServer;

const connectDB = async () => {
  const connectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, connectOptions);
      console.log('✅ MongoDB connected successfully');
      return;
    } catch (error) {
      console.warn('⚠️ MongoDB connection failed:', error.message);
      console.warn('Falling back to in-memory MongoDB for local development.');
    }
  } else {
    console.warn('⚠️ MONGODB_URI is not configured. Starting in-memory MongoDB instead.');
  }

  try {
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri, connectOptions);
    console.log('✅ Connected to in-memory MongoDB for local development');
  } catch (memoryError) {
    console.error('❌ In-memory MongoDB connection failed:', memoryError.message);
    process.exit(1);
  }
};

export default connectDB;
