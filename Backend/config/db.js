const mongoose = require("mongoose");

let environment = process.env.ENVIRONMENT || "development";

let mongoUrl =
  process.env.MONGODB_PROD_URL ||
  process.env.MONGODB_URI ||
  process.env.MONGODB_DEV_URL ||
  "mongodb://127.0.0.1:27017/quickRide";

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log(`Connected to Mongo DB successfully`);
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    if (!process.env.MONGODB_PROD_URL && !process.env.MONGODB_URI) {
      console.error("⚠️ WARNING: MONGODB_PROD_URL is missing in Render Environment Variables!");
    }
  });

module.exports = mongoose.connection;
