import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        console.log('Fetched Users:', response.data); // Debugging
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error.response?.data || error.message);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="relative min-h-screen bg-white">
      {/* Background Video */}
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

      {/* Top Bar */}
      <motion.div
        className="fixed inset-x-0 top-0 flex justify-between items-center p-2 bg-white backdrop-blur-md z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Logo */}
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
            className="hover:text-green-900"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </button>
          <button
            className="hover:text-green-900"
            onClick={() => navigate('/login')}
          >
            Logout
          </button>
        </motion.div>
      </motion.div>

      {/* Page Content */}
      <motion.div
        className="relative z-0 pt-24 px-6 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-4xl font-bold text-center text-green-700 mb-8">
          Manage Users
        </h1>
        <p className="text-center text-lg text-gray-600">
          View and manage all registered users on the platform.
        </p>

        {/* User List */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {users.map(user => (
            <motion.div
              key={user._id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-green-700">
                {user.username}
              </h2>
              <p className="text-sm text-gray-600 mt-2">{user.email}</p>
              <p className="text-sm text-gray-600 mt-2">Type: {user.userType}</p>
              <div className="mt-4">
                <button
                  className="text-green-700 hover:text-green-900 mr-2"
                  onClick={() => navigate(`/admin/edit-user/${user._id}`)}
                >
                  Edit
                </button>
                <button
                  className="text-red-700 hover:text-red-900"
                  onClick={() => console.log('Delete User')}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ManageUsers;
