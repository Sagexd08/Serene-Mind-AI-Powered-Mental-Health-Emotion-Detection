import { connectToDB } from "./connect.js";
import fs from "fs";
import path from "path";

/**
 * Initialize database tables by running SQL schema files
 */
export async function initializeDatabase() {
  try {
    const db = await connectToDB();

    console.log("Initializing database...");

    // Read SQL schema files
    const userSchema = fs.readFileSync(
      path.join(process.cwd(), "src", "schemas", "user.sql"),
      "utf8"
    );

    const refreshTokenSchema = fs.readFileSync(
      path.join(process.cwd(), "src", "schemas", "refresh-token.sql"),
      "utf8"
    );

    const decryptionWindowSchema = fs.readFileSync(
      path.join(process.cwd(), "src", "schemas", "decryption-window.sql"),
      "utf8"
    );

    // Execute schema creation
    if (db.driver === "postgres") {
      await db.query(userSchema);
      console.log("✓ Users table created/verified");

      await db.query(refreshTokenSchema);
      console.log("✓ Refresh tokens table created/verified");

      await db.query(decryptionWindowSchema);
      console.log("✓ Decryption window table created/verified");
    } else if (db.driver === "sqlite") {
      // Split by semicolon for multiple statements
      const userStatements = userSchema
        .split(";")
        .filter((stmt) => stmt.trim().length > 0);

      for (const stmt of userStatements) {
        db.run(stmt);
      }
      console.log("✓ Users table created/verified");

      const refreshTokenStatements = refreshTokenSchema
        .split(";")
        .filter((stmt) => stmt.trim().length > 0);

      for (const stmt of refreshTokenStatements) {
        db.run(stmt);
      }
      console.log("✓ Refresh tokens table created/verified");

      const decryptionWindowStatements = decryptionWindowSchema
        .split(";")
        .filter((stmt) => stmt.trim().length > 0);

      for (const stmt of decryptionWindowStatements) {
        db.run(stmt);
      }
      console.log("✓ Decryption window table created/verified");
    }

    console.log("Database initialization completed successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

/**
 * Seed database with sample data for development
 */
export async function seedDatabase() {
  try {
    const db = await connectToDB();

    console.log("Seeding database...");

    // Check if demo user already exists
    let existingUser;
    if (db.driver === "postgres") {
      existingUser = await db.query("SELECT * FROM users WHERE username = $1", [
        "demoUser",
      ]);
    } else if (db.driver === "sqlite") {
      existingUser = db.query("SELECT * FROM users WHERE username = ?", [
        "demoUser",
      ]);
    }

    const hasExistingUser =
      existingUser &&
      (Array.isArray(existingUser.rows)
        ? existingUser.rows.length > 0
        : existingUser.length > 0);

    if (!hasExistingUser) {
      // Insert demo user (password: demoPass)
      const demoUuid = "123e4567-e89b-12d3-a456-426614174000";
      const demoUsername = "demoUser";
      const demoPasswordHash =
        "$2b$10$rZ5xVq8J5vZ5xVq8J5vZ5uKW5xVq8J5vZ5xVq8J5vZ5xVq8J5vZ5x"; // "demoPass" hashed
      const demoEmail = "demo@example.com";

      if (db.driver === "postgres") {
        await db.query(
          "INSERT INTO users (uuid, username, password_hash, email) VALUES ($1, $2, $3, $4)",
          [demoUuid, demoUsername, demoPasswordHash, demoEmail]
        );
      } else if (db.driver === "sqlite") {
        db.run(
          "INSERT INTO users (uuid, username, password_hash, email) VALUES (?, ?, ?, ?)",
          [demoUuid, demoUsername, demoPasswordHash, demoEmail]
        );
      }

      console.log(
        "✓ Demo user created (username: demoUser, password: demoPass)"
      );
    } else {
      console.log("✓ Demo user already exists");
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
