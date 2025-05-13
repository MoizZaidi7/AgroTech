import Report from "../models/Reports.js";
import User from "../models/User.js";
import { Server } from 'socket.io';

// Get All Reports
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().populate("userId", "username email");
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error });
  }
};

// Web Analytics Report (real data)
const getWebAnalyticsReport = async (req, res) => {
  try {
    // Get real data from the request (passed by middleware)
    const analytics = req.app.get('webAnalyticsData') || {
      totalVisits: 0,
      maxVisitedPage: "/",
      averageSessionDuration: "0m 0s",
      visitTrends: []
    };

    // Emit real-time updates
    const io = req.app.get('socketio');
    io.emit('webAnalyticsUpdate', analytics);

    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ message: "Error generating web analytics", error });
  }
};

// User Engagement Report (real data)
const getUserEngagementReport = async (req, res) => {
  try {
    const users = await User.find();
    const activeUsers = await User.countDocuments({ isActive: true });
    const loggedInUsers = await User.countDocuments({ isLoggedIn: true });
    const newUsers = await User.countDocuments({ 
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
    });

    res.status(200).json({
      totalUsers: users.length,
      activeUsers,
      loggedInUsers,
      newUsers,
      engagementRate: ((loggedInUsers / users.length) * 100).toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating engagement report", error });
  }
};

// Sales Report (real data - assuming you have Order model)
const getSalesReport = async (req, res) => {
  try {
    const Order = require('../models/Order'); // Import your Order model
    
    const [cropSales, pesticideSales, equipmentRentals] = await Promise.all([
      Order.countDocuments({ productType: 'crop' }),
      Order.countDocuments({ productType: 'pesticide' }),
      Order.countDocuments({ productType: 'equipment' })
    ]);

    const revenueData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" }
        }
      }
    ]);

    res.status(200).json({
      cropSales,
      pesticideSales,
      equipmentRentals,
      totalRevenue: revenueData[0]?.totalRevenue || 0
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating sales report", error });
  }
};
// Export all functions
export {
  getAllReports,
  getUserEngagementReport,
  getWebAnalyticsReport,
  getSalesReport,
};
