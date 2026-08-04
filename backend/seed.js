const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const Builder = require("./models/Builder");
const User = require("./models/User");

dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/urbannest";

const seedDatabase = async () => {
  try {
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully for seeding.");

    // Clear existing test data
    await Builder.deleteMany({});
    await User.deleteMany({});

    const hashedPassword = await bcrypt.hash("Password123", 10);

    // Create Initial Sample Builder using Builder Model
    const builder = await Builder.create({
      companyName: "DLF Urban Developers Ltd",
      registrationNumber: "HARERA/GGM/2026/9021",
      ownerName: "Rajiv Singh",
      contactPersonName: "Anita Kumar",
      email: "contact@dlfurban.com",
      phoneNumber: "9876543210",
      websiteUrl: "https://www.dlf.in",
      officeAddress: "DLF Cyber City, Building 10, Sector 24, Gurgaon",
      password: hashedPassword,
      isVerified: true,
      projects: [
        {
          projectName: "DLF Ultima",
          status: "Active",
          launchYear: 2024
        },
        {
          projectName: "Godrej Woods",
          status: "Active",
          launchYear: 2025
        },
        {
          projectName: "Oberoi Sky City",
          status: "Active",
          launchYear: 2026
        }
      ]
    });

    console.log("----------------------------------------");
    console.log("✅ Sample Builder Collection Seeded Successfully!");
    console.log(`Builder Email: ${builder.email}`);
    console.log(`Company Name: ${builder.companyName}`);
    console.log(`RERA Registration: ${builder.registrationNumber}`);
    console.log("----------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error.message);
    process.exit(1);
  }
};

seedDatabase();
