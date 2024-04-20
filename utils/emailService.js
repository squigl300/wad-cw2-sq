// utils/emailService.js

const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

/**
 * Send an email
 * @param {string} to - The recipient email address
 * @param {string} subject - The email subject
 * @param {string} text - The email text content
 */
async function sendEmail(to, subject, text) {
  try {
    // Create a transporter using the email service provider settings
    const transporter = nodemailer.createTransport(sgTransport({
      auth: {
        api_key: process.env.SENDGRID_API_KEY,
      },
    }));

    // Define the email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

/**
 * Send a verification email
 * @param {string} to - The recipient email address
 * @param {string} verificationToken - The verification token
 */
async function sendVerificationEmail(to, verificationToken) {
  const subject = 'Email Verification';
  const text = `Click the following link to verify your email: http://localhost:3000/verify-email/${verificationToken}`;
  await sendEmail(to, subject, text);
}

/**
 * Send a password reset email
 * @param {string} to - The recipient email address
 * @param {string} resetToken - The password reset token
 */
async function sendResetEmail(to, resetToken) {
  const subject = 'Password Reset';
  const text = `Click the following link to reset your password: http://localhost:3000/reset-password/${resetToken}`;
  await sendEmail(to, subject, text);
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendResetEmail,
};