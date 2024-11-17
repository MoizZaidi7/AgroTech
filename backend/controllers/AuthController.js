import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';
import { generateOTP } from '../utils/otpGenerator.js';
import  generateToken  from '../utils/generate.js';
import { generateOtpEmail, generateWelcomeEmail} from '../utils/emailTemplates.js';
// Register a new user
const registerUser = async (req, res) => {
    const { username, email, password, userType, otp } = req.body;

    try {
        // If OTP is provided, verify the OTP
        if (otp) {
            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if OTP is expired
        if (user.resetPasswordExpire < Date.now()) {
            await User.findByIdAndDelete(user._id); // Delete expired user
            return res.status(400).json({ message: 'OTP expired. Please register again.' });
        } 

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
            const welcomeMessage = generateWelcomeEmail(user.username);

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
        const otpMessage = generateOtpEmail(username, otpCode);

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

        // Ensure the account is active
        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is not active. Please verify your email.' });
        }

        // Check if the password is valid
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ message: 'Invalid credentials' });

        // Generate JWT token with conditional expiration
        const expiresIn = rememberMe ? '7d' : '1h';
        const token = generateToken(user._id, expiresIn);

        // Return the logged-in user and token
        res.status(200).json({
            message: 'Login successful',
            user: { username: user.username, email: user.email, userType: user.userType },
            token,
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in', error });
    }
};

export { loginUser, registerUser };
