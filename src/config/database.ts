import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = 'mongodb://localhost:27017/receipt-scanner'; // Substitua pelo seu URI se usar MongoDB Atlas
    await mongoose.connect(mongoURI);
    console.log('Conectado ao MongoDB com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;