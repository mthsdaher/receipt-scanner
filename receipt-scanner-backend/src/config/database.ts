import mongoose from 'mongoose';
import { env } from './env';

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('MongoDB Connected!');
  } catch (error) {
    console.error('Error to connect to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;