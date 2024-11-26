import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { validatePassword } from '../utils/validatePassword.js';
import { generateOTP } from '../utils/otpGenerator.js';
import { hashOTP } from '../utils/hashotp.js';
import generateToken from '../utils/generateToken.js';
import { sendEmail  } from '../utils/sendEmail.js';
import { generateWelcomeEmail, generateOtpEmail } from '../utils/emailTemplates.js';

const registerUser = async (req, res) => {
    const { username, email, password, userType, otp } = req.body;

    try {
        // OTP Verification Flow
        if (otp) {
            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ message: 'User not found' });

            // Check if OTP is expired
            if (user.verificationTokenExpire < Date.now()) {
                await User.findByIdAndDelete(user._id); // Delete expired user
                return res.status(400).json({ message: 'OTP expired. Please register again.' });
            }

            const hashedOtp = hashOTP(otp);
            if (user.verificationToken !== hashedOtp) {
                return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
            }

            // Activate the user account
            user.verificationToken = undefined;
            user.verificationTokenExpire = undefined;
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

        // Registration Flow
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Validate userType
        const validUserTypes = ['Admin', 'Farmer', 'Customer', 'Seller'];
        if (!validUserTypes.includes(userType)) {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        // Validate password
        const { isValid, message } = validatePassword(password);
        if (!isValid) {
            return res.status(400).json({ message });
        }

        // Hash the password and generate OTP
        const hashedPassword = await bcrypt.hash(password, 10);
        const otpCode = generateOTP();
        const hashedOtp = hashOTP(otpCode);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            userType,
            verificationToken: hashedOtp,
            verificationTokenExpire: Date.now() + 10 * 60 * 1000, // 10 minutes
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

export default registerUser;


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

        // Check if the user is already logged in
        if (user.isLoggedIn) {
            console.error('User already logged in:', email);
            return res.status(400).json({ message: 'User is already logged in. Please log out first.' });
        }

        // Check if the password is valid
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ message: 'Invalid credentials' });

        // Generate JWT token with conditional expiration
        const expiresIn = rememberMe ? '7d' : '1h';
        const token = generateToken(user._id, expiresIn);

         // Update the isLoggedIn status
         console.log(user);
         user.isLoggedIn = true;
         await user.save();
         console.log(user);


        // Return the logged-in user and token
        res.status(200).json({
            message: 'Login successful',
            user: { username: user.username, email: user.email, userType: user.userType },
            token, expiresIn
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in', error });
    }
};

const logoutUser = async (req, res) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token not provided' });

    try {

        const user = await User.findById(req.user.id);
        if (!user) {
            console.error(`User with ID ${userId} not found.`);
            return res.status(404).json({ message: 'User not found. Please check the token.' });
        }

         // Check if the user is already logged in
         if (!user.isLoggedIn) {
            console.error('User already logged out:');
            return res.status(400).json({ message: 'User is already logged out. Please log in first.' });
        }

        // Update login status
        user.isLoggedIn = false;
        await user.save();

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'Error logging out', error });
    }
};

export { loginUser, registerUser, logoutUser };