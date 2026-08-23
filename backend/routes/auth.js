import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import User from '../models/User.js';

const router = express.Router();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. REGISTER / SEND OTP
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields (Name, Email, Password).' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check existing verified user
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'An account with this email already exists. Please Sign In.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (existingUser && !existingUser.isVerified) {
      existingUser.name = name;
      existingUser.phone = phone || '';
      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      existingUser.otpExpires = otpExpires;
      await existingUser.save();
    } else {
      await User.create({
        name,
        phone: phone || '',
        email: cleanEmail,
        password: hashedPassword,
        otp,
        otpExpires,
        isVerified: false
      });
    }

    // Always log OTP to backend console for instant testing
    console.log(`\n==============================================`);
    console.log(`🔐 REAL-TIME OTP CODE FOR [${cleanEmail}]: ${otp}`);
    console.log(`==============================================\n`);

    // Send Real Email if credentials exist
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        await transporter.sendMail({
          from: `"ChatHub Security" <${process.env.EMAIL_USER}>`,
          to: cleanEmail,
          subject: 'Your ChatHub Verification Code',
          text: `Welcome to ChatHub! Your 6-digit verification OTP is: ${otp}. It will expire in 10 minutes.`
        });
      } catch (mailError) {
        console.warn('⚠️ Real email delivery warning (use terminal code):', mailError.message);
      }
    }

    return res.status(200).json({ 
      message: 'Verification code sent to your email successfully.',
      email: cleanEmail 
    });

  } catch (err) {
    console.error('Registration Route Error:', err);
    return res.status(500).json({ message: err.message || 'Database connection error during registration.' });
  }
});

// 2. VERIFY OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: 'User record not found.' });
    }

    if (user.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Incorrect OTP code. Please enter the valid 6-digit code.' });
    }

    if (new Date() > new Date(user.otpExpires)) {
      return res.status(400).json({ message: 'This OTP code has expired. Please request a new one.' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'chathub_secret_key', { expiresIn: '7d' });

    return res.status(200).json({
      message: 'Verification successful! Welcome to ChatHub.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Verify OTP Error:', err);
    return res.status(500).json({ message: 'Error verifying OTP.' });
  }
});

// 3. LOGIN WITH PROPER VALIDATIONS
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ message: 'No account registered with this email. Please Join first.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Your email is not verified yet. Please complete verification.' });
    }

    // Password Check
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Incorrect password! Please enter your correct password.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'chathub_secret_key', { expiresIn: '7d' });

    return res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (err) {
    console.error('Login Route Error:', err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
});

export default router;