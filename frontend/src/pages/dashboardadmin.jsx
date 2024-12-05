import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const DashAdmin = () => {
  const navigate = useNavigate();

//   useEffect(() => {
//     // Check if user is logged in as admin
//     const user = JSON.parse(localStorage.getItem('user')); // Example: Get the logged-in user
//     if (!user || user.role !== 'admin') {
//       setError('Access Denied! Admins Only.');
//       setTimeout(() => navigate('/login'), 3000); // Redirect to login after 3 seconds
//     }
//   }, [navigate]);

  // Handle user management, complaints, subscriptions, etc.
  const handleManageUsers = () => {
    console.log('Manage Users');
  };

  const handleSystemPerformance = () => {
    console.log('System Performance');
  };

  const handleComplaints = () => {
    console.log('Manage Complaints');
  };

  const handleSubscriptions = () => {
    console.log('Manage Subscriptions');
  };

  const handleReports = () => {
    console.log('Generate Reports');
  };

  return (
<div className="relative min-h-screen bg-white">
  {/* Favicon */}
  <link rel="icon" type="image/png" href="/logo.png" />

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
        <span className="text-green-600 text-xs font-medium italic">Cultivating Smarter Futures</span>
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
        onClick={() => navigate('/home')}
      >
        Home
      </button>
      <button
        className="hover:text-green-900"
        onClick={() => navigate('/marketplace')}
      >
        Marketplace
      </button>
      <button
        className="hover:text-green-900"
        onClick={() => navigate('/support')}
      >
        Support
      </button>
      <button
        className="hover:text-green-900"
        onClick={() => navigate('/login')}
      >
        Logout
      </button>
    </motion.div>
  </motion.div>

  {/* Main Content */}
  <motion.div
    className="relative z-0 pt-24 px-6 py-8"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
  >
    <h1 className="text-4xl font-bold text-center text-green-700 mb-8">
      Admin Dashboard
    </h1>
    <p className="text-center text-lg text-gray-600">
      Manage user profiles, monitor system performance, and more.
    </p>

    {/* Admin Functionalities */}
    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <motion.div
        className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        onClick={handleManageUsers}
      >
        <h2 className="text-xl font-semibold text-green-700">Manage Users</h2>
        <p className="text-sm text-gray-600 mt-2">
          Oversee and manage user profiles and actions.
        </p>
      </motion.div>

      <motion.div
        className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        onClick={handleSystemPerformance}
      >
        <h2 className="text-xl font-semibold text-green-700">System Performance</h2>
        <p className="text-sm text-gray-600 mt-2">
          Monitor the performance of the system.
        </p>
      </motion.div>

      <motion.div
        className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        onClick={handleComplaints}
      >
        <h2 className="text-xl font-semibold text-green-700">Manage Complaints</h2>
        <p className="text-sm text-gray-600 mt-2">
          Handle user complaints and issues.
        </p>
      </motion.div>

      <motion.div
        className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        onClick={handleSubscriptions}
      >
        <h2 className="text-xl font-semibold text-green-700">Manage Subscriptions</h2>
        <p className="text-sm text-gray-600 mt-2">
          Oversee user subscriptions and plans.
        </p>
      </motion.div>

      <motion.div
        className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.1 }}
        onClick={handleReports}
      >
        <h2 className="text-xl font-semibold text-green-700">Generate Reports</h2>
        <p className="text-sm text-gray-600 mt-2">
          Generate various reports for system analysis.
        </p>
      </motion.div>
    </div>
  </motion.div>
</div>

  
  );
};

export default DashAdmin;