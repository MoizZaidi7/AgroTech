import express from 'express';
import {forgotPassword, resetPassword, changePassword, updateProfile, deleteUserAccount} from '../controllers/UserController.js';
import { loginUser, registerUser } from '../controllers/AuthController.js';
import authMiddleware  from '../middleware/authMiddleware.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser); // Register a new user
userRouter.post('/login', loginUser);       // Login a user
userRouter.post('/forgotPassword', forgotPassword);     //Forget Password
userRouter.put('/resetPassword/:token', resetPassword);  //Reset Password

userRouter.put('/changePassword', authMiddleware, changePassword); //Change Password
userRouter.put('/profile', authMiddleware, updateProfile); //Update Profile
userRouter.delete('/delete', authMiddleware, deleteUserAccount); //Delete User


export default userRouter;
