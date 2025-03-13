import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaChartLine, FaUsers, FaGlobe, FaDollarSign } from "react-icons/fa";
import DashHeader from "../components/DashHeader";

const ReportsPage = () => {
  const [reports, setReports] = useState({});
  const [selectedReport, setSelectedReport] = useState("User Engagement");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reportTypes = [
    { title: "User Engagement", icon: <FaUsers /> },
    { title: "Web Analytics", icon: <FaGlobe /> },
    { title: "Sales and Revenue", icon: <FaDollarSign /> },
  ];

  const fetchReports = async (type) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/reports/${type.toLowerCase().replace(/ /g, "-")}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(selectedReport);
  }, [selectedReport]);

  return (
    <div className="min-h-screen bg-white">
      <DashHeader />
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-gray-100 p-6">
          <h2 className="text-xl font-bold mb-4">Reports</h2>
          <ul>
            {reportTypes.map((report) => (
              <li
                key={report.title}
                onClick={() => setSelectedReport(report.title)}
                className={`p-4 cursor-pointer flex items-center space-x-2 ${
                  selectedReport === report.title ? "bg-green-500 text-white" : "text-gray-800"
                }`}
              >
                {report.icon}
                <span>{report.title}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Reports Display */}
        <div className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800">{selectedReport} Report</h1>
          </motion.div>

          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6">
              {selectedReport === "User Engagement" && (
                <div>
                  <p>Total Users: {reports.totalUsers}</p>
                  <p>Active Users: {reports.activeUsers}</p>
                  <p>Logged-in Users: {reports.loggedInUsers}</p>
                  <p>Engagement Rate: {reports.engagementRate}%</p>
                </div>
              )}

              {selectedReport === "Web Analytics" && (
                <div>
                  <p>Total Visits: {reports.totalVisits}</p>
                  <p>Most Visited Page: {reports.maxVisitedPage}</p>
                  <p>Avg. Session Duration: {reports.averageSessionDuration}</p>
                </div>
              )}

              {selectedReport === "Sales and Revenue" && (
                <div>
                  <p>Crop Sales: {reports.cropSales}</p>
                  <p>Pesticide Sales: {reports.pesticideSales}</p>
                  <p>Equipment Rentals: {reports.equipmentRentals}</p>
                  <p>Total Revenue: ${reports.totalRevenue}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
