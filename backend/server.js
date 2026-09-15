import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import os from 'os';
import mongoose from 'mongoose'; // 🟢 NEW: Database connection ke liye
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// 🟢 NEW: MongoDB Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chathub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB Connected Successfully');
}).catch((err) => {
  console.error('❌ MongoDB Connection Error:', err);
});

// CORS configuration - Allow all origins (Vercel, Localhost, Network IP)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Payload limits for images and voice notes
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Auth Routes (send-otp, verify-otp)
app.use('/api/auth', authRoutes);

// Helper function to get local IPv4
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

const localIP = getLocalIP();

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'lissaa0021@gmail.com',
    pass: process.env.EMAIL_PASS || 'llaosswitkmuryhb'
  }
});

// Real Email Invitation Endpoint
app.post('/api/invite', async (req, res) => {
  const { senderName, senderEmail, recipientEmail, roomId } = req.body;
  if (!recipientEmail) {
    return res.status(400).json({ message: 'Recipient email is required' });
  }

  // Invitation Link format
  const joinUrl = `http://${localIP}:5173/auth?redirect=/chat/${roomId}&inviter=${encodeURIComponent(senderName || senderEmail)}&inviterEmail=${encodeURIComponent(senderEmail)}`;

  try {
    await transporter.sendMail({
      from: `"ChatHub Security" <${process.env.EMAIL_USER || 'lissaa0021@gmail.com'}>`,
      to: recipientEmail.trim(),
      subject: `ChatHub: ${senderName || 'A friend'} invited you to an End-to-End Encrypted Chat!`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #101416; color: #ffffff; padding: 25px; border-radius: 12px; max-width: 480px; margin: auto; border: 1px solid #22c55e;">
          <h2 style="color: #22c55e; margin-top: 0; text-align: center;">🔒 ChatHub Encrypted Messenger</h2>
          <p style="color: #cbd5e1; font-size: 15px;">
            <strong>${senderName || senderEmail}</strong> has invited you to a secure, private one-to-one conversation on ChatHub.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${joinUrl}" style="background-color: #22c55e; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block;">
              Open Private Chat
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">Direct Link: <a href="${joinUrl}" style="color: #22c55e;">${joinUrl}</a></p>
        </div>
      `
    });
    console.log(`✅ Real Invite Email delivered to: ${recipientEmail}`);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Mail delivery error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Socket.io Real-Time Engine
const userSockets = new Map(); // email -> socketId
const roomUsers = new Map();   // roomId -> Set(socketIds)

const io = new Server(server, { 
  cors: { origin: '*' },
  maxHttpBufferSize: 1e8
});

io.on('connection', (socket) => {
  // 1. User registers email globally upon login
  socket.on('register_user', (email) => {
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      userSockets.set(cleanEmail, socket.id);
      socket.userEmail = cleanEmail;
      io.emit('online_users_list', Array.from(userSockets.keys()));
    }
  });

  // 2. Join 1-to-1 Room
  socket.on('join_room', ({ roomId, userEmail }) => {
    socket.join(roomId);
    if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Set());
    roomUsers.get(roomId).add(socket.id);

    const isOtherOnline = roomUsers.get(roomId).size > 1;
    io.to(roomId).emit('room_presence', { isOnline: isOtherOnline });
  });

  // 3. Real-time Encrypted Message Dispatch
  socket.on('send_message', (data) => {
    const isReceiverInRoom = roomUsers.has(data.roomId) && roomUsers.get(data.roomId).size > 1;

    // Room ke andar mojood doosre participant ko bhejein
    socket.to(data.roomId).emit('receive_message', {
      ...data,
      sender: 'them',
      status: isReceiverInRoom ? 'delivered' : 'sent'
    });

    // Global Push: Recipient ko notification aur data bhejta hai chahe wo room se bahar ho
    if (data.recipientEmail) {
      const recSocketId = userSockets.get(data.recipientEmail.toLowerCase().trim());
      if (recSocketId) {
        io.to(recSocketId).emit('global_unread_message', {
          ...data,
          sender: 'them',
          status: 'delivered'
        });
      }
    }
  });

  // 4. Seen status & typing indicator
  socket.on('mark_seen', ({ roomId, messageId }) => {
    socket.to(roomId).emit('message_seen', { messageId });
  });

  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user_typing', data);
  });

  // 5. Audio & Video Calling Signaling
  socket.on('start_call', ({ roomId, callerName, callerEmail, recipientEmail, type }) => {
    const cleanRecEmail = recipientEmail?.toLowerCase().trim();
    const recSocketId = userSockets.get(cleanRecEmail);

    if (recSocketId) {
      io.to(recSocketId).emit('incoming_call_ring', { roomId, callerName, callerEmail, type });
    }
    socket.to(roomId).emit('incoming_call_ring', { roomId, callerName, callerEmail, type });
  });

  socket.on('accept_call', ({ roomId }) => {
    socket.to(roomId).emit('call_connected');
  });

  socket.on('reject_call', ({ roomId }) => {
    socket.to(roomId).emit('call_rejected');
  });

  socket.on('end_call', ({ roomId }) => {
    socket.to(roomId).emit('call_terminated');
  });

  // 🟢 NEW: WEBRTC SIGNALING EVENTS (Video Calling ke liye Zaroori)
  socket.on('webrtc_offer', (data) => {
    socket.to(data.roomId).emit('webrtc_offer', data);
  });

  socket.on('webrtc_answer', (data) => {
    socket.to(data.roomId).emit('webrtc_answer', data);
  });

  socket.on('webrtc_ice_candidate', (data) => {
    socket.to(data.roomId).emit('webrtc_ice_candidate', data);
  });

  // 6. Handle Disconnect
  socket.on('disconnecting', () => {
    if (socket.userEmail) {
      userSockets.delete(socket.userEmail);
      io.emit('online_users_list', Array.from(userSockets.keys()));
    }

    for (const roomId of socket.rooms) {
      if (roomUsers.has(roomId)) {
        roomUsers.get(roomId).delete(socket.id);
        const isOnline = roomUsers.get(roomId).size > 1;
        io.to(roomId).emit('room_presence', { isOnline });
      }
    }
  });
});

const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ChatHub Server running on port ${PORT}`);
  console.log(`🌐 Local Network URL: http://${localIP}:${PORT}`);
});