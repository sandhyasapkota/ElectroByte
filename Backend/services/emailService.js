import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Log email configuration status
console.log('📧 Email Configuration Check:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  SMTP_USER:', process.env.SMTP_USER ? '✓ Set' : '✗ Not set');
console.log('  SMTP_PASS:', process.env.SMTP_PASS ? '✓ Set' : '✗ Not set');

// Create transporter - configure with your SMTP settings
const createTransporter = () => {
  // For production with Gmail
  if (process.env.NODE_ENV === 'production' && process.env.SMTP_USER) {
    console.log('📧 Email service configured with Gmail SMTP');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    // Verify transporter configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter verification failed:', error.message);
      } else {
        console.log('✅ Email transporter is ready to send emails');
      }
    });
    
    return transporter;
  }
  
  // Development: Use console logging
  console.log('📧 Email service running in DEV mode (logging only)');
  return {
    sendMail: async (mailOptions) => {
      console.log('\n========== EMAIL (Dev Mode) ==========');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Content:', mailOptions.html ? '[HTML Content]' : mailOptions.text);
      console.log('=======================================\n');
      return { messageId: 'dev-' + Date.now() };
    }
  };
};

const transporter = createTransporter();

// Email templates
const emailTemplates = {
  // Email verification template
  verification: (username, verificationLink) => ({
    subject: 'Verify Your ElectroByte Account',
    html: `<!DOCTYPE html>
<html>
<head>
<style>
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f4f6; }
.container { max-width: 600px; margin: 0 auto; padding: 20px; }
.header { background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
.header h1 { color: white; margin: 0; }
.content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; }
.button { display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
.footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
</style>
</head>
<body>
<div class="container">
<div class="header">
<h1>🖥️ ElectroByte</h1>
</div>
<div class="content">
<h2>Hi ${username},</h2>
<p>Welcome to ElectroByte! Please verify your email address to activate your account.</p>
<p style="text-align: center;">
<a href="${verificationLink}" class="button">Verify Email Address</a>
</p>
<p>Or copy and paste this link in your browser:</p>
<p style="word-break: break-all; color: #2563eb; font-size: 14px;">${verificationLink}</p>
<p>This link will expire in 24 hours.</p>
<p>If you didn't create an account, you can safely ignore this email.</p>
</div>
<div class="footer">
<p>© 2026 ElectroByte. All rights reserved.</p>
</div>
</div>
</body>
</html>`
  }),

  // Password reset template
  passwordReset: (username, resetLink) => ({
    subject: 'Reset Your ElectroByte Password',
    html: `<!DOCTYPE html>
<html>
<head>
<style>
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f4f6; }
.container { max-width: 600px; margin: 0 auto; padding: 20px; }
.header { background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
.header h1 { color: white; margin: 0; }
.content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; }
.button { display: inline-block; background: linear-gradient(135deg, #dc2626, #ea580c); color: white !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
.footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
.warning { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-top: 20px; }
</style>
</head>
<body>
<div class="container">
<div class="header">
<h1>🖥️ ElectroByte</h1>
</div>
<div class="content">
<h2>Hi ${username},</h2>
<p>We received a request to reset your password. Click the button below to create a new password:</p>
<p style="text-align: center;">
<a href="${resetLink}" class="button">Reset Password</a>
</p>
<p>Or copy and paste this link in your browser:</p>
<p style="word-break: break-all; color: #2563eb; font-size: 14px;">${resetLink}</p>
<div class="warning">
<strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
</div>
</div>
<div class="footer">
<p>© 2026 ElectroByte. All rights reserved.</p>
</div>
</div>
</body>
</html>`
  }),

  // Order confirmation template
  orderConfirmation: (username, order) => ({
    subject: `Order Confirmed - #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-box { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0; }
          .order-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .total { font-size: 18px; font-weight: bold; color: #2563eb; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .success { background: #d1fae5; color: #065f46; padding: 15px; border-radius: 8px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🖥️ ElectroByte</h1>
          </div>
          <div class="content">
            <div class="success">
              <h2 style="margin: 0;">✅ Order Confirmed!</h2>
            </div>
            <h3>Hi ${username},</h3>
            <p>Thank you for your order! Here are your order details:</p>
            <div class="order-box">
              <p><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
              <hr>
              <p class="total">Total: Rs. ${order.totalAmount?.toLocaleString()}</p>
            </div>
            <p>We'll send you another email when your order ships.</p>
            <p>You can track your order status in your account dashboard.</p>
          </div>
          <div class="footer">
            <p>© 2026 ElectroByte. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Appointment confirmation template
  appointmentConfirmation: (username, appointment, repairToken) => ({
    subject: 'Repair Appointment Confirmed',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-box { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0; }
          .token-box { background: #dbeafe; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .token { font-size: 24px; font-weight: bold; color: #2563eb; letter-spacing: 2px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔧 ElectroByte Repairs</h1>
          </div>
          <div class="content">
            <h2>Hi ${username},</h2>
            <p>Your repair appointment has been confirmed!</p>
            <div class="appointment-box">
              <p><strong>Device:</strong> ${appointment.deviceType} - ${appointment.deviceBrand}</p>
              <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
              <p><strong>Issue:</strong> ${appointment.issueDescription}</p>
            </div>
            <div class="token-box">
              <p style="margin: 0 0 10px 0;">Your Repair Tracking Token:</p>
              <p class="token">${repairToken}</p>
              <p style="font-size: 12px; color: #666; margin: 10px 0 0 0;">Use this token to track your repair status</p>
            </div>
            <p>We'll notify you when your device is ready.</p>
          </div>
          <div class="footer">
            <p>© 2026 ElectroByte. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Repair status update template
  repairStatusUpdate: (username, repair, status) => ({
    subject: `Repair Update - ${status.toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-box { padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .status-received { background: #dbeafe; color: #1e40af; }
          .status-diagnosing { background: #fef3c7; color: #92400e; }
          .status-repairing { background: #fed7aa; color: #c2410c; }
          .status-completed { background: #d1fae5; color: #065f46; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔧 Repair Status Update</h1>
          </div>
          <div class="content">
            <h2>Hi ${username},</h2>
            <p>There's an update on your repair:</p>
            <div class="status-box status-${status}">
              <h2 style="margin: 0;">${status.toUpperCase()}</h2>
            </div>
            <p><strong>Repair Token:</strong> ${repair.repairToken}</p>
            ${repair.technicianNotes ? `<p><strong>Technician Notes:</strong> ${repair.technicianNotes}</p>` : ''}
            ${repair.estimatedCost ? `<p><strong>Estimated Cost:</strong> Rs. ${repair.estimatedCost.toLocaleString()}</p>` : ''}
            <p>Track your repair status anytime on our website.</p>
          </div>
          <div class="footer">
            <p>© 2026 ElectroByte. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Email sending functions
export const sendVerificationEmail = async (email, username, token) => {
  const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;
  const template = emailTemplates.verification(username, verificationLink);
  
  console.log(`📧 Attempting to send verification email to: ${email}`);
  
  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"ElectroByte" <noreply@electrobyte.com>',
      to: email,
      subject: template.subject,
      html: template.html
    });
    console.log(`✅ Verification email sent successfully to ${email}. MessageId: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send verification email to ${email}:`, error.message);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email, username, token) => {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
  const template = emailTemplates.passwordReset(username, resetLink);
  
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || '"ElectroByte" <noreply@electrobyte.com>',
    to: email,
    subject: template.subject,
    html: template.html
  });
};

export const sendOrderConfirmationEmail = async (email, username, order) => {
  const template = emailTemplates.orderConfirmation(username, order);
  
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || '"ElectroByte" <noreply@electrobyte.com>',
    to: email,
    subject: template.subject,
    html: template.html
  });
};

export const sendAppointmentConfirmationEmail = async (email, username, appointment, repairToken) => {
  const template = emailTemplates.appointmentConfirmation(username, appointment, repairToken);
  
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || '"ElectroByte" <noreply@electrobyte.com>',
    to: email,
    subject: template.subject,
    html: template.html
  });
};

export const sendRepairStatusEmail = async (email, username, repair, status) => {
  const template = emailTemplates.repairStatusUpdate(username, repair, status);
  
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || '"ElectroByte" <noreply@electrobyte.com>',
    to: email,
    subject: template.subject,
    html: template.html
  });
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendAppointmentConfirmationEmail,
  sendRepairStatusEmail
};
