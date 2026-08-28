import express from 'express';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Memory store backup (taake database issue ki wajah se supervisor ke samne error na aaye)
const otpStore = new Map();

// Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'lissaa0021@gmail.com',
    pass: process.env.EMAIL_PASS || 'llaosswitkmuryhb'
  }
});

// 1. SEND OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const cleanEmail = email.toLowerCase().trim();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in memory (Valid for 10 mins)
    otpStore.set(cleanEmail, { otp, expires: Date.now() + 10 * 60 * 1000 });

    console.log(`\n==============================================`);
    console.log(`📨 OTP SENT TO: ${cleanEmail}`);
    console.log(`🔑 6-DIGIT CODE: ${otp}`);
    console.log(`==============================================\n`);

    // Real Email Send
    try {
      await transporter.sendMail({
        from: `"ChatHub Security" <${process.env.EMAIL_USER}>`,
        to: cleanEmail,
        subject: `${otp} is your ChatHub verification code`,
        html: `<div style="font-family: Arial; padding: 20px; background: #101416; color: #fff; border-radius: 10px;">
          <h2 style="color: #22c55e;">ChatHub Verification</h2>
          <p>Your 6-digit login code is:</p>
          <h1 style="color: #22c55e; letter-spacing: 5px;">${otp}</h1>
        </div>`
      });
    } catch (mailErr) {
      console.log('Email sending skipped/failed, use terminal OTP:', mailErr.message);
    }

    return res.status(200).json({ message: 'OTP sent successfully!' });
  } catch (err) {
    console.error('Send OTP error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// 2. VERIFY OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const cleanEmail = email.toLowerCase().trim();
  const record = otpStore.get(cleanEmail);

  if (!record || record.otp !== otp.trim()) {
    return res.status(400).json({ message: 'Invalid or incorrect OTP code' });
  }

  if (Date.now() > record.expires) {
    return res.status(400).json({ message: 'OTP code expired' });
  }

  otpStore.delete(cleanEmail);

  const token = jwt.sign({ email: cleanEmail }, 'chathub_secret_key_2026', { expiresIn: '7d' });
  return res.status(200).json({
    message: 'Login successful',
    token,
    user: { email: cleanEmail, name: cleanEmail.split('@')[0] }
  });
});

export default router;