import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User';
import connectDB from '../config/database';

// Sample user data
const users = [
  {
    fullName: 'Matheus Veloso',
    age: 27,
    email: 'mthsv@example.com',
    cellNumber: '+14376603333',
    password: 'test123*'
  },
];

// Function to seed the database
const seedDB = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Clear existing users
    await User.deleteMany({});
    console.log('Existing users cleared');

    // Insert sample users
    await User.insertMany(users);
    console.log('Database seeded with sample users');

    // Close the connection
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDB();