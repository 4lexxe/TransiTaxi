require("dotenv").config();
const mongoose = require("mongoose");
const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");

const MONGO_URI =
  process.env.ENVIRONMENT === "production"
    ? process.env.MONGODB_PROD_URL
    : process.env.MONGODB_DEV_URL || "mongodb://127.0.0.1:27017/quickRide";

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(MONGO_URI);
    console.log("Database connected successfully.");

    const demoUserEmail = "usuario@demo.com";
    const demoCaptainEmail = "conductor@demo.com";
    const demoPassword = "Password123!";

    // Delete existing demo user & captain if any
    await userModel.deleteOne({ email: demoUserEmail });
    await captainModel.deleteOne({ email: demoCaptainEmail });

    // Hash passwords
    const hashedUserPassword = await userModel.hashPassword(demoPassword);
    const hashedCaptainPassword = await captainModel.hashPassword(demoPassword);

    // Create Demo User
    const user = await userModel.create({
      fullname: {
        firstname: "Demo",
        lastname: "Usuario",
      },
      email: demoUserEmail,
      password: hashedUserPassword,
      phone: "1234567890",
      emailVerified: true,
    });
    console.log("✅ Demo User created:", user.email);

    // Create Demo Captain
    const captain = await captainModel.create({
      fullname: {
        firstname: "Demo",
        lastname: "Conductor",
      },
      email: demoCaptainEmail,
      password: hashedCaptainPassword,
      phone: "0987654321",
      status: "active",
      emailVerified: true,
      vehicle: {
        color: "Verde",
        number: "ABC-123",
        capacity: 4,
        type: "car",
      },
      location: {
        type: "Point",
        coordinates: [-73.935242, 40.730610],
      },
    });
    console.log("✅ Demo Captain created:", captain.email);

    console.log("\n-------------------------------------------");
    console.log("🎉 Seeding completed successfully!");
    console.log("Demo Rider Credentials:");
    console.log(`  Email: ${demoUserEmail}`);
    console.log(`  Password: ${demoPassword}`);
    console.log("\nDemo Captain Credentials:");
    console.log(`  Email: ${demoCaptainEmail}`);
    console.log(`  Password: ${demoPassword}`);
    console.log("-------------------------------------------\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
