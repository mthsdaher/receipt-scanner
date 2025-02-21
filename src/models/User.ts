import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for the User document
interface IUser extends Document {
  fullName: string;
  age: number;
  email: string;
  cellNumber: string;
}

// Create the User schema
const UserSchema: Schema = new Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [0, 'Age cannot be negative'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  cellNumber: {
    type: String,
    required: [true, 'Cell number is required'],
    trim: true,
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Export the User model
export default mongoose.model<IUser>('User', UserSchema);