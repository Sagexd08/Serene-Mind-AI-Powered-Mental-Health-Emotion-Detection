import { generateKeys } from "./utils/generateKeys.js";
generateKeys();

import dotenv from "dotenv";
dotenv.config({ quiet: true });

import { app } from "./app.js";

const port = Number(process.env.PORT || 3000);

import { initializeDatabase } from "./db/init.js";


// Initialize Database and Start Server
(async () => {
  try {
    console.log("Starting server initialization...");
    await initializeDatabase();
    console.log("Database initialized successfully");

    app.listen(port, "0.0.0.0", () => {
      console.log(`Server listening on http://0.0.0.0:${port}`);
      console.log(`Accessible at http://localhost:${port}`);
      console.log(`Network access at http://192.168.1.6:${port}`);
    });
  } catch (error) {
    console.error("Failed to initialize:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Stack:", error.stack);
    }
    process.exit(1);
  }
})();
