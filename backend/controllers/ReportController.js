import Report from "../models/Reports.js";
import User from "../models/User.js";

// Get All Reports
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().populate("userId", "username email");
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error });
  }
};

// User Engagement Report
const getUserEngagementReport = async (req, res) => {
  try {
    const users = await User.find();
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.isActive).length;
    const loggedInUsers = users.filter(user => user.isLoggedIn).length;

    res.status(200).json({
      totalUsers,
      activeUsers,
      loggedInUsers,
      engagementRate: ((loggedInUsers / totalUsers) * 100).toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating engagement report", error });
  }
};

// Web Analytics Report (mock data for now)
const getWebAnalyticsReport = async (req, res) => {
  try {
    const analytics = {
      totalVisits: 1056,
      maxVisitedPage: "/dashboard",
      averageSessionDuration: "5m 30s",
    };
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ message: "Error generating web analytics", error });
  }
};

// Sales Report (mock data, replace with actual sales data fetching logic)
const getSalesReport = async (req, res) => {
  try {
    const salesData = {
      cropSales: 150,
      pesticideSales: 75,
      equipmentRentals: 30,
      totalRevenue: 12000,
    };
    res.status(200).json(salesData);
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
