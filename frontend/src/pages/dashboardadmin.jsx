import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const DashAdmin = () => {

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
          <DashboardTile
            title="Manage Users"
            description="Oversee and manage user profiles and actions."
            navigateTo="/ManageUsers"
            delay={0.3}
          />
          <DashboardTile
            title="Manage Complaints"
            description="Handle user complaints and issues."
            navigateTo="/admin/complaints"
            delay={0.5}
          />
          <DashboardTile
            title="Generate Reports"
            description="Generate various reports for system analysis."
            navigateTo="/admin/reports"
            delay={0.7}
          />
          <DashboardTile
            title="Resolve Complaints"
            description="Resolve pending complaints from users."
            navigateTo="/admin/resolve-complaints"
            delay={0.9}
          />
          <DashboardTile
            title="Register User"
            description="Register new users with custom roles."
            navigateTo="/admin/register-user"
            delay={1.1}
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

export default DashAdmin;
