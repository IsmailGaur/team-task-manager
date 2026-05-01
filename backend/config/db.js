const mongoose = require('mongoose');

const connectDB = async () => {
  console.log("MONGO_URI FROM ENV:", process.env.MONGO_URI);

  const conn = await mongoose.connect(process.env.MONGO_URI);

  console.log(`✅ MongoDB connected: ${conn.connection.host}`);

  return conn; // 🔥 VERY IMPORTANT
};

module.exports = connectDB;