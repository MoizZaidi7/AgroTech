import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';

const DashAdmin = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('Manage Users');

  // Register User States
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    userType: 'Farmer',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  const sidebarItems = [
    { title: 'Manage Users' },
    { title: 'Register User' },
  ];

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