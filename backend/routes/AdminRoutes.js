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

AdminRouter.get('/users', authMiddleware, authorize(['Admin']), getRegisteredUsers); // Only Admin can view users
AdminRouter.put('/users/:userId', authMiddleware, authorize(['Admin']), updateUserDetails); // Only Admin can edit users
AdminRouter.delete('/users/:userId', authMiddleware, authorize(['Admin']), deleteUser); // Only Admin can delete users
AdminRouter.get('/complaints', authMiddleware, authorize(['Admin']), fetchComplaints); // Only Admin can fetch complaints
AdminRouter.put('/complaints/:complaintId', authMiddleware, authorize(['Admin']), resolveComplaints); // Only Admin can resolve complaints
AdminRouter.post('/generate-report', authMiddleware, authorize(['Admin']), generateReport); // Only Admin can generate reports
AdminRouter.get('/reports', authMiddleware, authorize(['Admin']), fetchReports); // Only Admin can view reports
AdminRouter.post('/registerUser', authMiddleware, authorize(['Admin']), registerUserByAdmin); // Only Admin can register users

export default AdminRouter;