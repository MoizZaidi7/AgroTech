import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch } from 'react-redux';
import { logout } from '../Redux/authslice'; // Adjust the path if necessary
import axiosInstance from '../utils/axiosConfig';

const DashHeader = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
const handleNavigationClick = (path) => {
        navigate(path); // Navigate to the specified path
      };
  
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
    <div className="relative">
        <motion.div
          className="fixed inset-x-0 top-0 flex justify-between items-center p-2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{ backgroundColor: 'transparent', boxShadow: 'none' }}
      >

        {/* Logo Section */}
        <motion.div
          className="flex items-center space-x-2"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <img
            src="/logo.png"
            alt="Logo"
            className="h-10 w-10 bg-opacity-70 rounded-full border-2 border-white"
          />
          <div className="flex flex-col">
            <span className="text-green-700 text-xl font-bold">AgroTech</span>
            <span className="text-green-600 text-xs font-medium italic">
              Cultivating Smarter Futures
            </span>
          </div>
        </motion.div>

        {/* Navigation Links */}
        <motion.div
          className="flex space-x-4 text-lg text-green-700"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <button
            onClick={() => handleNavigationClick("/")}
            className="hover:text-green-900"
          >
            Home
          </button>
          <button
            onClick={() => handleNavigationClick("/marketplace")}
            className="hover:text-green-900"
          >
            Marketplace
          </button>
          <Link to="/support" className="hover:text-green-900">
            Support
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-1 px-2 rounded-lg hover:bg-red-600 transition"
            >
            Logout
          </button>
          
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DashHeader;
