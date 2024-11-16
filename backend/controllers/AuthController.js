import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';
import { generateOTP } from '../utils/otpGenerator.js';

const registerUser = async (req, res) => {
    const { username, email, password, userType, otp } = req.body;

    try {
        // If OTP is provided, verify the OTP
        if (otp) {
            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ message: 'User not found' });

            const hashedOtp = crypto.createHash('sha256').update(otp.toString()).digest('hex');
            if (user.resetPasswordToken !== hashedOtp || user.resetPasswordExpire < Date.now()) {
                return res.status(400).json({ message: 'Invalid or expired OTP' });
            }

            // Clear OTP fields and activate the user
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            user.isActive = true;
            await user.save();

            // Send Welcome Email
            const welcomeMessage = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2 style="color: #4CAF50;">Welcome to AgroTech!</h2>
                    <p>Hello <strong>${user.username}</strong>,</p>
                    <p>We're excited to have you on board! You now have access to all the features of AgroTech.</p>
                    <p>Feel free to explore and let us know if you have any questions.</p>
                    <p>Happy farming,</p>
                    <p><strong>The AgroTech Team</strong></p>
                </div>
            `;

            await sendEmail({
                email: user.email,
                subject: 'Welcome to AgroTech!',
                htmlMessage: welcomeMessage,
            });

            return res.status(200).json({ message: 'Account activated successfully. Welcome email sent.' });
        }

        // For new registration, check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Validate userType
        const validUserTypes = ['Admin', 'Farmer', 'Customer', 'Seller'];
        if (!validUserTypes.includes(userType)) {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const otpCode = generateOTP();
        const hashedOtp = crypto.createHash('sha256').update(otpCode.toString()).digest('hex');

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            userType,
            resetPasswordToken: hashedOtp,
            resetPasswordExpire: Date.now() + 10 * 60 * 1000, // 10 minutes
            isActive: false, // User inactive until OTP is verified
        });

        await newUser.save();

        // Send OTP via email
        const otpMessage = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Your OTP Code</h2>
                <p>Hello <strong>${username}</strong>,</p>
                <p>Thank you for signing up for AgroTech. To activate your account, please use the following OTP:</p>
                <h3 style="color: #4CAF50;">${otpCode}</h3>
                <p>This OTP is valid for 10 minutes.</p>
                <p>Best regards,</p>
                <p><strong>The AgroTech Team</strong></p>
            </div>
        `;

        await sendEmail({
            email,
            subject: 'Activate Your AgroTech Account',
            htmlMessage: otpMessage,
        });

        res.status(201).json({ message: 'OTP sent to your email for account activation' });
    } catch (error) {
        console.error('Error registering user:', error);
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
  
  export {loginUser, registerUser};