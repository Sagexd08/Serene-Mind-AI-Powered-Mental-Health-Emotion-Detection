import { connectToDB } from "./connect.js";
import fs from "fs";
import path from "path";

/**
 * Initialize database tables by running SQL schema files
 */
export async function initializeDatabase(): Promise<void> {
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

    const handoffSchema = fs.readFileSync(
      path.join(process.cwd(), "src", "schemas", "handoff.sql"),
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

      await db.query(handoffSchema);
      console.log("✓ Handoffs table created/verified");
    } else if (db.driver === "sqlite") {
      // Split by semicolon for multiple statements
      const userStatements = userSchema
        .split(";")
        .filter((stmt) => stmt.trim().length > 0);

      for (const stmt of userStatements) {
        try {
          await db.run(stmt);
        } catch (err) {
          // Table might already exist, continue
          console.log("User schema:", err instanceof Error ? err.message : String(err));
        }
      }
      console.log("✓ Users table created/verified");

      const refreshTokenStatements = refreshTokenSchema
        .split(";")
        .filter((stmt) => stmt.trim().length > 0);

      for (const stmt of refreshTokenStatements) {
        try {
          await db.run(stmt);
        } catch (err) {
          console.log("Refresh token schema:", err instanceof Error ? err.message : String(err));
        }
      }
      console.log("✓ Refresh tokens table created/verified");

      const decryptionWindowStatements = decryptionWindowSchema
        .split(";")
        .filter((stmt) => stmt.trim().length > 0);

      for (const stmt of decryptionWindowStatements) {
        try {
          await db.run(stmt);
        } catch (err) {
          console.log("Decryption window schema:", err instanceof Error ? err.message : String(err));
        }
      }
      console.log("✓ Decryption window table created/verified");

      const handoffStatements = handoffSchema
        .split(";")
        .filter((stmt) => stmt.trim().length > 0);

      for (const stmt of handoffStatements) {
        try {
          await db.run(stmt);
        } catch (err) {
          console.log("Handoff schema:", err instanceof Error ? err.message : String(err));
        }
      }
      console.log("✓ Handoffs table created/verified");
    }

    console.log("Database initialization completed successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

