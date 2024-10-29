import bcrypt from 'bcryptjs';
import generateToken from '../utils/generate.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendemail.js';
import crypto from 'crypto';

// Register a new user
const registerUser = async (req, res) => {
    const { username, email, password, userType } = req.body;
  
    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });

      // Validate userType
      const validUserTypes = ['Admin', 'Farmer', 'Customer', 'Seller'];
      if (!validUserTypes.includes(userType)) {
            return res.status(400).json({ message: 'Invalid user type' });
         }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user object and save it
      const newUser = new User({ username, email, password: hashedPassword, userType});
      await newUser.save();
  
      // Generate JWT token
      const token = generateToken(newUser._id);  
      // Return the newly created user and token
      res.status(201).json({ user: newUser, token });
    } catch (error) {
      res.status(500).json({ message: 'Error registering user', error });
    }
  };
  
  // Login an existing user
  const loginUser = async (req, res) => {
    const { email, password, rememberMe } = req.body;
  
    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      // Check if the password is valid
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return res.status(400).json({ message: 'Invalid credentials' });
  
      // Generate JWT token
      const expiresIn = rememberMe ? '7d' : '1h';
      const token = generateToken(user._id, expiresIn);
  
      // Return the logged-in user and token
      res.status(200).json({ user, token });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error });
    }
  };
  
  const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 400000000;
        await user.save();

        const resetUrl = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${resetToken}`;
        const message = `You requested a password reset. Click here to reset: ${resetUrl}`;

        try {
            await sendEmail({ email: user.email, subject: 'Password Reset', message });
            res.status(200).json({ message: 'Reset email sent successfully' });
        } catch (emailError) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            res.status(500).json({ message: 'Error sending email. Please try again later.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error processing request', error });
    }
};

    // Reset Password
    const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        // Find user by reset token and check expiration
        const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

        // Set new password
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password', error });
    }
};

const updateProfile = async (req, res) => {
  const { username, email, userType } = req.body;
  try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      user.username = username || user.username;
      user.email = email || user.email;
      user.userType = userType || user.userType;

      const updatedUser = await user.save();
      res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
      res.status(500).json({ message: 'Error updating profile', error });
  }
};

const changePassword = async(req, res) => {
  const {currentPassword, newPassword} = req.body;
  try {
    const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if(!isPasswordValid) return res.status(400).json({message:"Current Password is Invalid"});

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.status(200).json({message: 'Password Updated Successfully'});
    } catch (error) {
        res.status(500).json({message:'Error updating password', error});
 
      }

  };






  export {registerUser, loginUser, forgotPassword, resetPassword, updateProfile, changePassword};