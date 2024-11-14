import nodemailer from 'nodemailer';

const sendEmail = async ({ email, subject, message }) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",  // or the specific SMTP server of your email provider
            port: 465,  // 587 for TLS or 465 for SSL
            secure: true,  // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            text: message,
        };

        // Send the email and log response
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.response}`);
        console.log(email);
    } catch (error) {
        console.error(`Error sending email: ${error.message}`);
        throw new Error('Email could not be sent');
    }
};

export default sendEmail;
