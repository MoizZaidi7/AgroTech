// OTP Email Template
export const generateOtpEmail = (username, otpCode) => `
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

// Welcome Email Template
export const generateWelcomeEmail = (username) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #4CAF50;">Welcome to AgroTech!</h2>
        <p>Hello <strong>${username}</strong>,</p>
        <p>We're excited to have you on board! You now have access to all the features of AgroTech.</p>
        <p>Feel free to explore and let us know if you have any questions.</p>
        <p>Happy farming,</p>
        <p><strong>The AgroTech Team</strong></p>
    </div>
`;

// Reset Password Email Template

const generatePasswordResetEmail = (username, resetLink) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Reset Your Password</h2>
        <p>Hello <strong>${username}</strong>,</p>
        <p>We received a request to reset your password. Click the link below to reset it:</p>
        <p>${resetLink},</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,</p>
        <p><strong>The AgroTech Team</strong></p>
    </div>
`;
export default generatePasswordResetEmail
