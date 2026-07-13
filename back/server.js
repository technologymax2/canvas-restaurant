const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 1. Database Connection (MongoDB)
mongoose.connect('mongodb://localhost:27017/canvas-restaurant');

// 2. Order Schema
const OrderSchema = new mongoose.Schema({
  type: String, // 'dine-in' or 'online'
  items: Array,
  tableNumber: Number,
  phone: String,
  screenshot: String,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', OrderSchema);

// 3. File Upload Setup
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// 4. API Endpoints
app.post('/api/orders', upload.single('screenshot'), async (req, res) => {
  try {
    const newOrder = await Order.create({
      ...req.body,
      items: JSON.parse(req.body.items),
      screenshot: req.file ? req.file.filename : null
    });

    // ትዕዛዙ እንደገባ ለሁሉም የተገናኙ አድሚኖች ማሳወቅ
    io.emit('new-order', newOrder);
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ለሁሉም ትዕዛዞች
app.get('/api/orders', async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

// 5. Socket.io Connection
io.on('connection', (socket) => {
  console.log('Admin connected:', socket.id);
});

server.listen(5000, () => console.log('Server running on port 5000'));