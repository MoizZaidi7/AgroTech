import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // State to store user data
  const [loading, setLoading] = useState(true); // State to handle loading
  const [error, setError] = useState(null); // State to handle errors

  // Fetch user data when the component loads
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log("No token found. Redirecting to login.");
          navigate('/login'); // Redirect to login if no token
          return;
        }

        // Fetch user data from the API
        const response = await axios.get('http://localhost:5000/api/users/UserProfile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.user); // Update user state with the fetched data
        setLoading(false); // Stop the loading spinner
      } catch (error) {
        console.error("Failed to fetch user data:", error.response?.data?.message || error.message);
        setError("Failed to load user data. Please try again later.");
        setLoading(false); // Stop the loading spinner
      }
    };

    fetchUserData();
  }, [navigate]);

  // Handle logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log("No token found. User might not be logged in.");
        return;
      }

      // Send POST request to logout the user
      const response = await axios.post(
        'http://localhost:5000/api/users/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // On success, clear the token and user data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userData');

      console.log(response.data.message);

      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error.response?.data?.message || error.message);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Dashboard Header */}
      <div className="w-full bg-blue-500 text-white py-4 shadow-md">
        <h1 className="text-center text-2xl font-bold">AgroTech Dashboard</h1>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg w-11/12 lg:w-2/3">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.username}!</h2>

        <div className="mb-6">
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.userType}</p>
        </div>

        {/* Dashboard Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
            Crop Health Monitoring
          </button>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded">
            Soil Analysis
          </button>
          <button className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded">
            Yield Prediction
          </button>
          <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded">
            Account Settings
          </button>
        </div>

        {/* Logout Button */}
        <div className="mt-6">
          <button
            className="bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded w-full"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
