const { sendEmail } = require('../config/nodemailer');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp) => {
  await sendEmail({
    to: email,
    subject: 'Your OTP for Taxi Booking System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Email Verification</h2>
        <p>Your OTP code is:</p>
        <div style="background: #f0f0f0; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 8px;">
          ${otp}
        </div>
        <p style="color: #666; margin-top: 15px;">This code expires in <strong>10 minutes</strong>.</p>
        <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { generateOTP, sendOTPEmail };
