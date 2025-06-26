import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User';
import connectDB from '../config/database';
import { Password } from '../utils/password';

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

     // Hash passwords before inserting
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user, // Spread user data
        password: await Password.toHash(user.password), // Hash the password
      }))
    );

    // Insert sample users
    await User.insertMany(hashedUsers);
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