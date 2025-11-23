import { connectToDB } from "../db/connect";

async function submitDecrytionRequest(key: string): Promise<void> {
  try {
      const db = await connectToDB();
      // generate 
      if (db.driver === "postgres") {
           // submit key and time in postgres
         result = await db.query();
       } else if (db.driver === "sqlite") {
         result = db.query();
       }
  } catch (error) {
    console.error("Failed to submit decryption request:", error);
  }
}
