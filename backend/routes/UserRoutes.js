import express from 'express';
import {forgotPassword, resetPassword, changePassword, updateProfile, deleteUserAccount, getUserProfile, createComplaint, getComplaintsByUser} from '../controllers/UserController.js';
import { googleLogin, loginUser, logoutUser, registerUser} from '../controllers/AuthController.js';
import authMiddleware  from '../middleware/authMiddleware.js';


const userRouter = express.Router();

userRouter.post('/register', registerUser); // Register a new user
userRouter.post('/login', loginUser);       // Login a user
userRouter.post('/forgotPassword', forgotPassword);     //Forget Password
userRouter.post('/resetPassword/:token', resetPassword);  //Reset Password
userRouter.post("/google-login", googleLogin);

userRouter.get('/UserProfile', authMiddleware, getUserProfile); 
userRouter.put('/changePassword', authMiddleware, changePassword); 
userRouter.put('/profile', authMiddleware, updateProfile); 
userRouter.delete('/delete', authMiddleware, deleteUserAccount); 
userRouter.post('/logout', authMiddleware, logoutUser); 

userRouter.post('/complaints/create', authMiddleware, createComplaint); 
userRouter.get('/complaints', authMiddleware, getComplaintsByUser); 
export default userRouter;