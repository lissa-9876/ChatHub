import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json()); // Allow JSON data

// 🔗 API Routes
app.use('/api/auth', authRoutes);

// 🔌 Socket.io Setup
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log(`⚡ User Connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`❌ User Disconnected: ${socket.id}`));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Chathub Server running on http://localhost:${PORT}`);
});