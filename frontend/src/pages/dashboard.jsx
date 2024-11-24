import React from "react";

const Dashboard = () => {
  // Example user information (replace with actual data from props or API call)
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    userType: "Farmer", // Example user type
  };

  // Handle logout
  const handleLogout = () => {
    console.log("Logout function triggered");
    // Add logout logic here (e.g., clearing tokens and redirecting)
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Dashboard Header */}
      <div className="w-full bg-blue-500 text-white py-4 shadow-md">
        <h1 className="text-center text-2xl font-bold">AgroTech Dashboard</h1>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg w-11/12 lg:w-2/3">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user.name}!</h2>

        <div className="mb-6">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.userType}</p>
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
