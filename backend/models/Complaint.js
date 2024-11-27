// models/Complaint.js
import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  complaintText: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'closed'], 
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: false,
  },
  resolutionText: {
    type: String,
    required: false, 
  },
});

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
