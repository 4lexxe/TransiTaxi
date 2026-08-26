const mongoose = require("mongoose");

let environment = process.env.ENVIRONMENT || "development";

let mongoUrl =
  process.env.MONGODB_URI ||
  (environment === "production"
    ? process.env.MONGODB_PROD_URL
    : process.env.MONGODB_DEV_URL) ||
  "mongodb://127.0.0.1:27017/quickRide";

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log(`Connected to Mongo DB (${environment})`);
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
  });

module.exports = mongoose.connection;
