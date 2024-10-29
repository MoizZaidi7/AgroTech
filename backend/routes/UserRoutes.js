import express from 'express';
import { registerUser, loginUser, forgotPassword, resetPassword, changePassword, updateProfile,} from '../controllers/UserController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser); // Register a new user
userRouter.post('/login', loginUser);       // Login a user
userRouter.post('/forgotPassword', forgotPassword);     //Forget Password
userRouter.put('/resetPassword/:token', resetPassword);  //Reset Password

userRouter.put('/changePassword', authMiddleware, changePassword); //Change Password
userRouter.put('/profile', authMiddleware, updateProfile); //Update Profile



export default userRouter;
