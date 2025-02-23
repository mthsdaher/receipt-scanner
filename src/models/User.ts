import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  age: number;
  email: string;
  cellNumber: string;
  password: string;
  resetToken?: string; 
  resetTokenExpires?: Date; 
}

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
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false, // Prevents password from being returned in queries by default
  },
  resetToken: {
    type: String, // Stores the hashed or plain reset token
    default: undefined,
  },
  resetTokenExpires: {
    type: Date, // Expiration date for the reset token
    default: undefined,
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

export default mongoose.model<IUser>('User', UserSchema);