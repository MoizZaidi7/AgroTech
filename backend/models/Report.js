// models/Report.js
import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reportType: {
    type: String,
    enum: ['userActivity', 'salesData', 'systemMetrics'],
    required: true,
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  reportData: {
    type: Object, 
    required: true,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  filters: {
    type: Object,
    required: false, 
  },
});

const Report = mongoose.model('Report', reportSchema);

export default Report;
