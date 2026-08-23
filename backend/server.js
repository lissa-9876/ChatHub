import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Socket.io
const io = new Server(server, { cors: { origin: '*' } });
io.on('connection', (socket) => {
  socket.on('join_room', (roomId) => socket.join(roomId));
  socket.on('send_message', (data) => socket.to(data.roomId).emit('receive_message', data));
});

// MongoDB Connection with bufferTimeout config
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chathub';

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
})
.then(() => console.log('🌿 MongoDB Atlas Connected Successfully!'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.log('💡 TIP: Check your network or use local MongoDB: mongodb://127.0.0.1:27017/chathub');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ChatHub Backend Live on Port: ${PORT}`);
});