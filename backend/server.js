require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// -------------------
// Middleware
// -------------------
app.use(express.json());

// Allow all origins for now (avoid CORS blocking healthcheck)
app.use(cors());

// -------------------
// Health Check (Railway uses this)
// -------------------
app.get('/health', (req, res) => {
  res.status(200).send('OK'); // keep it simple
});

// -------------------
// Routes
// -------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/dashboard', require('./routes/dashboard'));

// -------------------
// Error Handler
// -------------------
app.use(errorHandler);

// -------------------
// Start Server FIRST (IMPORTANT)
// -------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// -------------------
// Connect DB (non-blocking)
// -------------------
connectDB()
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
  });