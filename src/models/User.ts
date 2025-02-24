import mongoose, { Schema, Document } from 'mongoose';

export enum UserStatus {
  Pending_Activation = 'Pending_Activation',
  Active = 'Active',
}

export interface IUser extends Document {
  fullName: string;
  age: number;
  email: string;
  cellNumber: string;
  password: string;
  resetToken?: string;
  resetTokenExpires?: Date;
  verifCd?: string; // Verification code for email confirmation
  expDt?: Date; // Expiration date for verification code
  status: UserStatus; // User status (Pending_Activation or Active)
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
    type: String,
    default: undefined,
  },
  resetTokenExpires: {
    type: Date,
    default: undefined,
  },
  verifCd: {
    type: String,
    default: undefined,
  },
  expDt: {
    type: Date,
    default: undefined,
  },
  status: {
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.Pending_Activation,
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

export default mongoose.model<IUser>('User', UserSchema);