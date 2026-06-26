const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("🔄 Attempting to connect to MongoDB...");
    console.log("📍 URI:", process.env.MONGO_URI);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: "majority",
    });

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("✗ MongoDB Connection Error:");
    console.error("  Message:", error.message);
    console.error("  Code:", error.code);
    console.error("  Name:", error.name);
    process.exit(1);
  }
};

module.exports = connectDB;
