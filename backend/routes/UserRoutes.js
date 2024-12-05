import express from 'express';
import {forgotPassword, resetPassword, changePassword, updateProfile, deleteUserAccount, getUserProfile} from '../controllers/UserController.js';
import { googleLogin, loginUser, logoutUser, registerUser} from '../controllers/AuthController.js';
import authMiddleware  from '../middleware/authMiddleware.js';
import authorize from '../middleware/authorize.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser); // Register a new user
userRouter.post('/login', loginUser);       // Login a user
userRouter.post('/forgotPassword', forgotPassword);     //Forget Password
userRouter.post('/resetPassword/:token', resetPassword);  //Reset Password
userRouter.post("/google-login", googleLogin);


userRouter.get('/UserProfile', authMiddleware, authorize(['viewProfile']), getUserProfile); 
userRouter.put('/changePassword', authMiddleware, authorize(['changePassword']), changePassword); 
userRouter.put('/profile', authMiddleware, authorize(['updateProfile']), updateProfile); 
userRouter.delete('/delete', authMiddleware, authorize(['deleteAccount']), deleteUserAccount); 
userRouter.post('/logout', authMiddleware, logoutUser); 

export default userRouter;