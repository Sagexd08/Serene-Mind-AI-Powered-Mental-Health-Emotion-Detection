import dotenv from "dotenv";
import { initializeDatabase, seedDatabase } from "../db/init.js";

// Load environment variables
dotenv.config();

async function main() {
  try {
    console.log("=== Database Setup ===\n");

    // Initialize database tables
    await initializeDatabase();

    console.log("\n");

    // Seed with demo data
    await seedDatabase();

    console.log("\n=== Setup Complete ===");
    process.exit(0);
  } catch (error) {
    console.error("\n=== Setup Failed ===");
    console.error(error);
    process.exit(1);
  }
}

main();
