import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';

const DashAdmin = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('Manage Users');
  const [complaintTab, setComplaintTab] = useState('Active'); // 'Active' or 'Resolved'

  // Register User States
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    userType: 'Farmer',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Complaints States
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [complaintStatus, setComplaintStatus] = useState('Pending');
  const [complaintResponse, setComplaintResponse] = useState('');
  const [updateError, setUpdateError] = useState('');

  // Fetch Users
  useEffect(() => {
    if (activeSection === 'Manage Users') {
      const fetchUsers = async () => {
        try {
          const response = await axiosInstance.get('http://localhost:5000/api/admin/users', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setUsers(response.data.users);
        } catch (error) {
          console.error('Error fetching users:', error.response?.data || error.message);
        }
      };
      fetchUsers();
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === "Manage Complaints") {
      fetchComplaints();
    }
  }, [activeSection]);
   
  // Separate function to fetch complaints for reuse
  const fetchComplaints = async () => {
    setLoading(true); // Show loading while fetching complaints

    try {
      const response = await axiosInstance.get("http://localhost:5000/api/admin/complaints", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.status === 200) {
        console.log("Received complaints:", response.data.complaints);
        setComplaints(response.data.complaints);
      } else {
        console.error("Failed to fetch complaints:", response.data);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error.response?.data || error.message);
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  // Handle Register User
  const handleRegisterUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const response = await axiosInstance.post(
        'http://localhost:5000/api/admin/registerUser',
        registerForm,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      setSuccessMessage(response.data.message);
      setRegisterForm({
        username: '',
        email: '',
        password: '',
        userType: 'Farmer',
      });
      
      // Refresh user list if on manage users page
      if (activeSection === 'Manage Users') {
        const usersResponse = await axiosInstance.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUsers(usersResponse.data.users);
      }
    } catch (err) {
      console.error('Error registering user:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error registering user. Please try again.');
    }
  };

  // Delete User
  const handleDeleteUser = async (userId) => {
    try {
      const response = await axiosInstance.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.status === 200) {
        alert('User deleted successfully');
        setUsers(users.filter(user => user._id !== userId));
      }
    } catch (error) {
      console.error('Error deleting user:', error.message);
      alert('Error deleting user. Please try again.');
    }
  };

  // Save User Changes
  const handleSaveChanges = async () => {
    if (!selectedUser) return;
    setLoading(true);

    try {
      const response = await axiosInstance.put(
        `http://localhost:5000/api/admin/users/${selectedUser._id}`,
        selectedUser,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      if (response.status === 200) {
        setUsers(users.map(user => (user._id === selectedUser._id ? selectedUser : user)));
        setIsModalOpen(false);
        alert('User updated successfully');
      }
    } catch (error) {
      console.error('Error updating user:', error.message);
      alert('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Update Complaint Status
  const handleUpdateComplaintStatus = async (e) => {
    e.preventDefault(); // Prevent form submission refresh
    if (!selectedComplaint) return;
    
    setLoading(true);
    setUpdateError('');

    // Log the data we're about to send
    console.log("Updating complaint:", selectedComplaint._id);
    console.log("New status:", complaintStatus);
    console.log("Admin response:", complaintResponse);

    try {
      const requestData = { 
        status: complaintStatus 
      };
      
      // Only include adminResponse if it has content
      if (complaintResponse.trim()) {
        requestData.adminResponse = complaintResponse;
      }
      
      console.log("Request data:", requestData);
      
      const response = await axiosInstance.put(
        `http://localhost:5000/api/admin/complaints/${selectedComplaint._id}`,
        requestData,
        {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log("Update response:", response);

      if (response.status === 200) {
        // Refresh complaints from server instead of updating locally
        await fetchComplaints();
        setIsComplaintModalOpen(false);
        alert('Complaint status updated successfully');
      }
    } catch (error) {
      console.error('Error updating complaint status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update complaint status. Please try again.';
      setUpdateError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get username by userId
  const getUsernameById = (userId) => {
    const user = users.find(user => user._id === userId);
    return user ? user.username : 'Unknown User';
  };

  const sidebarItems = [
    { title: 'Manage Users' },
    { title: 'Register User' },
    { title: 'Manage Complaints' },
  ];

  // Fixed filtering of complaints based on status - ensure case insensitive comparison
  const getFilteredComplaints = () => {
    // First check if there are any complaints to filter
    if (!complaints || complaints.length === 0) {
      return { activeComplaints: [], resolvedComplaints: [] };
    }
    
    // Filter with case-insensitive check
    const resolvedComplaints = complaints.filter(complaint => 
      complaint.status && complaint.status.toLowerCase() === 'resolved'
    );
    
    const activeComplaints = complaints.filter(complaint => 
      !complaint.status || complaint.status.toLowerCase() !== 'resolved'
    );
    
    return { activeComplaints, resolvedComplaints };
  };
  
  // Get filtered complaints based on current tab
  const { activeComplaints, resolvedComplaints } = getFilteredComplaints();

  const renderContent = () => {
    switch (activeSection) {
      case 'Manage Users':
        return (
          <div className="relative z-0 pt-32 px-6 py-8">
            <h1 className="text-4xl font-bold text-center text-white mb-8">
              Manage Users
            </h1>
            <p className="text-center text-lg text-gray-200">
              View and manage all registered users on the platform.
            </p>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {users.map(user => (
                <div
                  key={user._id}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <h2 className="text-xl font-semibold text-green-700">
                    {user.username}
                  </h2>
                  <p className="text-sm text-gray-600 mt-2">{user.email}</p>
                  <p className="text-sm text-gray-600 mt-2">{user.phoneNumber}</p>
                  <p className="text-sm text-gray-600 mt-2">Type: {user.userType}</p>
                  <div className="mt-4">
                    <button
                      className="text-green-700 hover:text-green-900 mr-2"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsModalOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-700 hover:text-red-900"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal for Editing User */}
            {isModalOpen && selectedUser && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl font-semibold mb-4">Edit User</h2>
                  <form>
                    <div className="mb-4">
                      <label className="block text-gray-700">Username</label>
                      <input
                        type="text"
                        value={selectedUser.username}
                        onChange={(e) =>
                          setSelectedUser({ ...selectedUser, username: e.target.value })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md text-black"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700">Email</label>
                      <input
                        type="email"
                        value={selectedUser.email}
                        onChange={(e) =>
                          setSelectedUser({ ...selectedUser, email: e.target.value })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md text-black"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700">User Type</label>
                      <select
                        value={selectedUser.userType}
                        onChange={(e) =>
                          setSelectedUser({ ...selectedUser, userType: e.target.value })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md text-black"
                      >
                        <option value="Farmer">Farmer</option>
                        <option value="Customer">Customer</option>
                        <option value="Seller">Seller</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    <div className="mt-4 flex justify-between">
                      <button
                        type="button"
                        className="bg-red-600 text-white p-2 rounded-md"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="bg-green-600 text-white p-2 rounded-md"
                        onClick={handleSaveChanges}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      case 'Register User':
        return (
          <div className="relative z-0 pt-32 px-6 py-8">
            <h1 className="text-4xl font-bold text-center text-white mb-8">
              Register New User
            </h1>

            {error && (
              <div className="bg-red-500 text-white p-4 mb-6 rounded-md max-w-md mx-auto">{error}</div>
            )}
            {successMessage && (
              <div className="bg-green-500 text-white p-4 mb-6 rounded-md max-w-md mx-auto">{successMessage}</div>
            )}

            <form onSubmit={handleRegisterUser} className="space-y-6 max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
              <div>
                <label className="block text-lg font-medium text-green-700">Username</label>
                <input
                  type="text"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-green-700">Email</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-green-700">Password</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-green-700">User Type</label>
                <select
                  value={registerForm.userType}
                  onChange={(e) => setRegisterForm({...registerForm, userType: e.target.value})}
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md text-black"
                >
                  <option value="Farmer">Farmer</option>
                  <option value="Customer">Customer</option>
                  <option value="Seller">Seller</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="mt-4">
                <button 
                  type="submit" 
                  className="w-full bg-green-700 text-white p-2 rounded-md hover:bg-green-800 transition"
                >
                  Register User
                </button>
              </div>
            </form>
          </div>
        );
      case 'Manage Complaints':
        return (
          <div className="relative z-0 pt-32 px-6 py-8">
            <h1 className="text-4xl font-bold text-center text-white mb-8">
              Manage Complaints
            </h1>
            <p className="text-center text-lg text-gray-200">
              View and manage all complaints submitted by users.
            </p>

            {/* Tab Navigation */}
            <div className="flex justify-center mt-8 bg-white rounded-lg p-1 max-w-md mx-auto">
              <button
                className={`px-4 py-2 rounded-lg ${
                  complaintTab === 'Active'
                    ? 'bg-green-600 text-white'
                    : 'text-green-700 hover:bg-green-50'
                }`}
                onClick={() => setComplaintTab('Active')}
              >
                Active Complaints
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  complaintTab === 'Resolved'
                    ? 'bg-green-600 text-white'
                    : 'text-green-700 hover:bg-green-50'
                }`}
                onClick={() => setComplaintTab('Resolved')}
              >
                Resolved Complaints
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center mt-8">
                <div className="bg-white p-4 rounded-md">
                  <p className="text-green-700">Loading complaints...</p>
                </div>
              </div>
            ) : complaintTab === 'Active' ? (
              // Active Complaints Section
              activeComplaints.length === 0 ? (
                <div className="flex justify-center mt-8">
                  <div className="bg-white p-4 rounded-md">
                    <p className="text-green-700">No active complaints found.</p>
                  </div>
                </div>
              ) : (
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {activeComplaints.map(complaint => (
                    <div
                      key={complaint._id}
                      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="flex justify-between items-start">
                        <h2 className="text-xl font-semibold text-green-700">
                          {complaint.name || 'No Title'}
                        </h2>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          complaint.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {complaint.status || 'Pending'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-2 font-semibold">
                        Submitted by: {complaint.userId ? getUsernameById(complaint.userId) : 'Unknown User'}
                      </p>
                      
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Type:</span> {complaint.type || 'General'}
                      </p>
                      
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">{complaint.description || 'No description provided'}</p>
                      </div>
                      
                      {complaint.adminResponse && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">Admin Response:</p>
                          <div className="p-3 bg-green-50 rounded-md">
                            <p className="text-sm text-gray-700">{complaint.adminResponse}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <p className="text-xs text-gray-500">
                          Submitted: {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                        {complaint.updatedAt && complaint.updatedAt !== complaint.createdAt && (
                          <p className="text-xs text-gray-500">
                            Last Updated: {new Date(complaint.updatedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setComplaintStatus(complaint.status || 'Pending');
                            setComplaintResponse(complaint.adminResponse || '');
                            setIsComplaintModalOpen(true);
                          }}
                        >
                          Update Status
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // Resolved Complaints Section
              resolvedComplaints.length === 0 ? (
                <div className="flex justify-center mt-8">
                  <div className="bg-white p-4 rounded-md">
                    <p className="text-green-700">No resolved complaints found.</p>
                  </div>
                </div>
              ) : (
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {resolvedComplaints.map(complaint => (
                    <div
                      key={complaint._id}
                      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="flex justify-between items-start">
                        <h2 className="text-xl font-semibold text-green-700">
                          {complaint.name || 'No Title'}
                        </h2>
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {complaint.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-2 font-semibold">
                        Submitted by: {complaint.userId ? getUsernameById(complaint.userId) : 'Unknown User'}
                      </p>
                      
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Type:</span> {complaint.type || 'General'}
                      </p>
                      
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">{complaint.description || 'No description provided'}</p>
                      </div>
                      
                      {complaint.adminResponse && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">Admin Response:</p>
                          <div className="p-3 bg-green-50 rounded-md">
                            <p className="text-sm text-gray-700">{complaint.adminResponse}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <p className="text-xs text-gray-500">
                          Submitted: {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                        {complaint.updatedAt && complaint.updatedAt !== complaint.createdAt && (
                          <p className="text-xs text-gray-500">
                            Last Updated: {new Date(complaint.updatedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setComplaintStatus(complaint.status);
                            setComplaintResponse(complaint.adminResponse || '');
                            setIsComplaintModalOpen(true);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Modal for Updating Complaint Status */}
            {isComplaintModalOpen && selectedComplaint && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Update Complaint Status</h2>
                  
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-700">Complaint Details</h3>
                    <p className="text-sm text-gray-600">{selectedComplaint.title || 'No Title'}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      By: {selectedComplaint.userId ? getUsernameById(selectedComplaint.userId) : 'Unknown User'}
                    </p>
                    {selectedComplaint._id && (
                      <p className="text-xs text-gray-500 mt-1">Complaint ID: {selectedComplaint._id}</p>
                    )}
                  </div>
                  
                  {updateError && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                      {updateError}
                    </div>
                  )}
                  
                  <form onSubmit={handleUpdateComplaintStatus}>
                    <div className="mb-4">
                      <label className="block text-gray-700">Status</label>
                      <select
                        value={complaintStatus}
                        onChange={(e) => setComplaintStatus(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-black"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700">Admin Response</label>
                      <textarea
                        value={complaintResponse}
                        onChange={(e) => setComplaintResponse(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-black h-32"
                        placeholder="Enter your response to this complaint..."
                      />
                    </div>
                    
                    <div className="mt-6 flex justify-between">
                      <button
                        type="button"
                        className="bg-red-600 text-white p-2 rounded-md"
                        onClick={() => {
                          setIsComplaintModalOpen(false);
                          setUpdateError('');
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-green-600 text-white p-2 rounded-md"
                        disabled={loading}
                      >
                        {loading ? 'Updating...' : 'Update Status'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Sidebar */}
      <div className="w-64 bg-white shadow-lg fixed top-16 left-0 h-full p-6">
        <ul className="space-y-4">
          {sidebarItems.map((item) => (
            <li
              key={item.title}
              className={`cursor-pointer flex items-center space-x-2 p-2 rounded-lg 
                ${activeSection === item.title 
                  ? 'bg-green-600 text-white' 
                  : 'text-green-700 hover:bg-green-50'
                }`}
              onClick={() => setActiveSection(item.title)}
            >
              <span>{item.title}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 relative overflow-y-auto bg-green-700 text-white">
        {renderContent()}
      </div>
    </div>
  );
};

export default DashAdmin;