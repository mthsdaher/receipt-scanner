import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for the Receipt document
export interface IReceipt extends Document {
  userId: mongoose.Types.ObjectId; // Reference to the User
  amount: number;
  date: Date;
  description: string;
  category?: string; // Optional field for categorization (e.g., food, utilities)
}

// Create the Receipt schema
const ReceiptSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: [true, 'User ID is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  category: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Export the Receipt model
export default mongoose.model<IReceipt>('Receipt', ReceiptSchema);