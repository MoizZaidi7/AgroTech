const mongoose = require("mongoose");

const WebAnalyticsSchema = new mongoose.Schema({
  pageUrl: String,
  visitCount: Number,
  uniqueVisitors: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("WebAnalytics", WebAnalyticsSchema);
