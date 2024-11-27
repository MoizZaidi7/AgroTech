import express from 'express';
import {
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  deleteUserAccount,
  getUserProfile,
} from '../controllers/UserController.js';
import {
  googleLogin,
  loginUser,
  logoutUser,
  registerUser,
} from '../controllers/AuthController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import authorize from '../middleware/authorize.js';

const userRouter = express.Router();

// Public Routes
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);       
userRouter.post('/forgotPassword', forgotPassword);    
userRouter.post('/resetPassword/:token', resetPassword);  
userRouter.post('/google-login', googleLogin);           

userRouter.get('/UserProfile', authMiddleware, authorize(['viewProfile']), getUserProfile); 
userRouter.put('/changePassword', authMiddleware, authorize(['changePassword']), changePassword); 
userRouter.put('/profile', authMiddleware, authorize(['updateProfile']), updateProfile); 
userRouter.delete('/delete', authMiddleware, authorize(['deleteAccount']), deleteUserAccount); 
userRouter.post('/logout', authMiddleware, logoutUser); 


export default userRouter;
