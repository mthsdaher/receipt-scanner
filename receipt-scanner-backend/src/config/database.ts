import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/receipt-scanner';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected!');
  } catch (error) {
    console.error('Error to connect to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;