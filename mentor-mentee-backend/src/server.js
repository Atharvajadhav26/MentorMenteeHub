require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const testRoutes = require('./routes/testRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const menteeRoutes = require('./routes/menteeRoutes');

const app = express();
const http = require('http');
const server = http.createServer(app);
const socket = require('./socket');

// ✅ Initialize Socket.io
socket.init(server);

// ✅ Initialize Cron Jobs
const startCronJobs = require('./utils/cronJobs');
startCronJobs();

// ✅ Middleware Setup
app.use(cors());

// 🔥 IMPORTANT FIX: Increase payload size (for images/forms)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ✅ Routes
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/mentee', menteeRoutes);

// ✅ 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not mapped in matrix'
  });
});

// ✅ Global Error Handler
app.use(errorHandler);

// ✅ Server Setup
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`[SERVER] Running on port ${PORT} 🚀`);
});