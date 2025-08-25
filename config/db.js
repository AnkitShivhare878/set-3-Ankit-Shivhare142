const mongoose = require("mongoose");

async function connectDB(uri) {
  if (!uri) {
    throw new Error("MONGO_URI is missing! Check your .env file.");
  }

  try {
    await mongoose.connect(uri, { autoIndex: true });
    console.log(" MongoDB connected successfully");
  } catch (err) {
    console.error(" MongoDB connection error:", err.message);
    throw err;
  }
}

module.exports = connectDB;
