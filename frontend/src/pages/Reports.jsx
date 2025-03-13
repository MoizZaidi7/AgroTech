import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { Line, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { io } from 'socket.io-client';

Chart.register(...registerables);

const socket = io('http://localhost:5000');

const ReportsPage = () => {
  const [selectedReportType, setSelectedReportType] = useState('User Engagement');
  const [userEngagement, setUserEngagement] = useState(null);
  const [webAnalytics, setWebAnalytics] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [webAnalyticsData, setWebAnalyticsData] = useState({
    totalVisits: 0,
    maxVisitedPage: '',
    averageSessionDuration: '',
    visitTrends: [],
  });

  // Socket.io - Real-time web analytics updates
  useEffect(() => {
    socket.on('webAnalyticsUpdate', (data) => {
      setWebAnalyticsData(data);
    });

    return () => socket.off('webAnalyticsUpdate');
  }, []);

  // Fetch data when report type changes
  useEffect(() => {
    fetchReport(selectedReportType);
  }, [selectedReportType]);

  // Fetch reports directly from backend
  const fetchReport = async (type) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let response;

      switch (type) {
        case 'User Engagement':
          response = await axiosInstance.get('http://localhost:5000/api/reports/user-engagement', {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('User Engagement:', response.data);
          setUserEngagement(response.data);
          break;

        case 'Web Analytics':
          response = await axiosInstance.get('http://localhost:5000/api/reports/web-analytics', {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Web Analytics:', response.data);
          setWebAnalytics(response.data);
          break;

        case 'Sales and Revenue':
          response = await axiosInstance.get('http://localhost:5000/api/reports/sales-report', {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Sales Report:', response.data);
          setSalesReport(response.data);
          break;

        default:
          console.warn('Invalid report type selected');
      }
    } catch (error) {
      console.error(`Error fetching ${type} report:`, error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Render charts based on selected report type
  const renderCharts = () => {
    switch (selectedReportType) {
      case 'User Engagement': {
        if (!userEngagement) return <p>No user engagement data available.</p>;

        const { totalUsers = 0, activeUsers = 0, loggedInUsers = 0 } = userEngagement;
        return (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-green-700">User Engagement Chart</h3>
            <Bar
              data={{
                labels: ['Total Users', 'Active Users', 'Logged In Users'],
                datasets: [
                  {
                    label: 'User Engagement',
                    data: [totalUsers, activeUsers, loggedInUsers],
                    backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(153, 102, 255, 0.2)'],
                    borderColor: ['rgba(75, 192, 192, 1)', 'rgba(54, 162, 235, 1)', 'rgba(153, 102, 255, 1)'],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          </div>
        );
      }

      case 'Web Analytics': {
        if (!webAnalyticsData || webAnalyticsData.visitTrends.length === 0) {
          return <p>No web analytics data available.</p>;
        }

        const { totalVisits, maxVisitedPage, averageSessionDuration, visitTrends } = webAnalyticsData;

        return (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-green-700">Web Analytics Chart</h3>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white shadow-md p-4 rounded-lg text-center">
                <h4 className="text-lg font-semibold text-gray-700">Total Visits</h4>
                <p className="text-2xl text-green-600 font-bold">{totalVisits}</p>
              </div>
              <div className="bg-white shadow-md p-4 rounded-lg text-center">
                <h4 className="text-lg font-semibold text-gray-700">Max Visited Page</h4>
                <p className="text-md text-gray-600">{maxVisitedPage || 'N/A'}</p>
              </div>
              <div className="bg-white shadow-md p-4 rounded-lg text-center">
                <h4 className="text-lg font-semibold text-gray-700">Avg. Session Duration</h4>
                <p className="text-md text-gray-600">{averageSessionDuration || 'N/A'}</p>
              </div>
            </div>

            {/* Line Chart */}
            <Line
              data={{
                labels: visitTrends.map((_, index) => `Day ${index + 1}`),
                datasets: [
                  {
                    label: 'Visits',
                    data: visitTrends,
                    fill: false,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.1,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          </div>
        );
      }

      case 'Sales and Revenue': {
        if (!salesReport) return <p>No sales report data available.</p>;

        const { cropSales = 0, pesticideSales = 0, equipmentRentals = 0 } = salesReport;
        return (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-green-700">Sales and Revenue Chart</h3>
            <Bar
              data={{
                labels: ['Crop Sales', 'Pesticide Sales', 'Equipment Rentals'],
                datasets: [
                  {
                    label: 'Sales',
                    data: [cropSales, pesticideSales, equipmentRentals],
                    backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(255, 159, 64, 0.2)', 'rgba(255, 205, 86, 0.2)'],
                    borderColor: ['rgba(255, 99, 132, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 205, 86, 1)'],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          </div>
        );
      }

      default:
        return <p className="text-red-500 text-center">No data available for the selected report.</p>;
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center text-green-700 mb-8">Reports and Analytics</h1>
      <p className="text-center text-lg text-gray-700 mb-8">View and analyze data across the platform.</p>

      {/* Report Type Selector */}
      <div className="flex justify-center">
        <div className="bg-white p-4 rounded-md shadow-md w-full max-w-md">
          <label className="block text-green-700 font-medium mb-2">Select Report Type:</label>
          <select
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-black"
          >
            <option value="User Engagement">User Engagement</option>
            <option value="Web Analytics">Web Analytics</option>
            <option value="Sales and Revenue">Sales and Revenue</option>
          </select>
        </div>
      </div>

      {/* Report Charts */}
      {loading ? (
        <div className="flex justify-center mt-8">
          <p className="text-green-700">Loading reports...</p>
        </div>
      ) : (
        <div className="mt-12">{renderCharts()}</div>
      )}
    </div>
  );
};

export default ReportsPage;
