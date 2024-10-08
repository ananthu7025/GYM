const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables from .env

const transporter = nodemailer.createTransport({
    service: 'gmail', // Using Gmail as the service
    auth: {
        user: process.env.EMAIL_USER, // Your email from .env
        pass: process.env.EMAIL_PASS  // Your email password from .env
    }
});

// Function to send styled HTML email
const sendEmail = async (email, subject, content) => {
    // Email HTML structure with styles
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
                <header style="background-color: #f7f7f7; padding: 10px; text-align: center; border-bottom: 1px solid #ccc;">
                    <h1 style="color: #333;">Luminouslogics</h1>
                    <p style="color: #666;"> Welcome!</p>
                </header>
                <main style="padding: 20px;">
                    <h2 style="color: #333;">Hello!</h2>
                    <p style="color: #555;">${content}</p>
                </main>
                <footer style="background-color: #f7f7f7; padding: 10px; text-align: center; border-top: 1px solid #ccc;">
                    <p style="color: #666;">&copy; ${new Date().getFullYear()} Luminouslogics. All rights reserved.</p>
                    <p style="color: #666;">kochi kerala</p>
                </footer>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}`);
    } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
        throw new Error('Error sending email');
    }
};

module.exports = {
    sendEmail
};
