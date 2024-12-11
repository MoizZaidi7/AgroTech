import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../Redux/authslice'; // Adjust the path if necessary
import axiosInstance from '../utils/axiosconfig';

const DashFarmer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call the logout API
      await axiosInstance.post(
        'http://localhost:5000/api/users/logout', // URL
        {}, // No body data needed for logout
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, // Headers with token
        }
      );
  
      // Dispatch Redux logout action
      dispatch(logout());
  
      // Clear any localStorage token if stored
      localStorage.removeItem('token');
  
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error.response?.data || error.message);
      alert('Logout failed. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen bg-white">
      <div className="absolute inset-0 w-full h-full">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/backvideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-0 pt-24 px-6 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-green-700 mb-8">Farmer Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
        <p className="text-center text-lg text-gray-600">
          Access tools and services tailored for farmers.
        </p>

        {/* Farmer Functionalities */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <DashboardTile
            title="Soil Analysis"
            description="Analyze soil quality for better crop yields."
            navigateTo="/soil-analysis"
            delay={0.3}
          />
          <DashboardTile
            title="Crop Recommendation"
            description="Get crop suggestions based on soil and climate data."
            navigateTo="/crop-recommendation"
            delay={0.5}
          />
          <DashboardTile
            title="Market Insights"
            description="Explore market trends and sell your crops."
            navigateTo="/online-marketplace"
            delay={0.7}
          />
        </div>
      </motion.div>
    </div>
  );
};

const DashboardTile = ({ title, description, navigateTo, delay }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      onClick={() => navigate(navigateTo)}
    >
      <h2 className="text-xl font-semibold text-green-700">{title}</h2>
      <p className="text-sm text-gray-600 mt-2">{description}</p>
    </motion.div>
  );
};

export default DashFarmer;
