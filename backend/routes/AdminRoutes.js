import express from 'express';
import {
  getRegisteredUsers,
  updateUserDetails,
  deleteUser,
  fetchComplaints,
  resolveComplaints,
  generateReport,
  fetchReports,
  registerUserByAdmin
} from '../controllers/AdminController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import authorize from '../middleware/authorize.js';
const AdminRouter = express.Router();
// Correct the first route by removing the extra parentheses
AdminRouter.get('/users', authMiddleware, authorize(['viewAllUsers']), getRegisteredUsers); // View Registered Users
AdminRouter.put('/users/:userId', authMiddleware, authorize(['editUser']), updateUserDetails); // Edit User Details
AdminRouter.delete('/users/:userId', authMiddleware, authorize(['deleteUser']), deleteUser); // Delete User
// Additional routes for complaints, reports, etc.
AdminRouter.get('/fetchomplaints', authMiddleware, authorize(['manageComplaints']), fetchComplaints); // Manage Complaints
AdminRouter.put('/resolveComplaints', authMiddleware, authorize(['resolveComplaints']), resolveComplaints); // Resolve Complaints
AdminRouter.post('/generate-report', authMiddleware, authorize(['generateReports']), generateReport); // Generate Reports
AdminRouter.get('/reports', authMiddleware, authorize(['viewReports']), fetchReports); // View Reports
AdminRouter.post('/registerUser', authMiddleware, authorize(['registerUser']), registerUserByAdmin); // Register New User
export default AdminRouter;