import { requestQueue, RequestJob } from "../config/queue.js";

/**
 * Initialize queue processor for ML pipeline
 * Handles processing of encrypted data submissions
 */
export async function initializeQueueProcessor(): Promise<void> {
  try {
    // Listen for queue events
    requestQueue.on("completed", (job) => {
      console.log(`✓ Job ${job.id} completed`);
    });

    requestQueue.on("failed", (job, err) => {
      console.error(`✗ Job ${job?.id} failed:`, err?.message);
    });

    requestQueue.on("error", (err) => {
      console.error("Queue error:", err);
    });

    // Process jobs from the queue
    await requestQueue.process(async (job) => {
      const { encryptedData, userId, decryptionKey } =
        job.data as RequestJob & {
          decryptionKey: string;
        };

      try {
        console.log(`Processing job ${job.id} for user ${userId}`);

        // TODO: Send to ML pipeline
        // This is where the encrypted data would be sent to the actual ML pipeline
        // along with the decryption key for processing
        console.log(`Job ${job.id}: encrypted data ready for ML pipeline`);

        return {
          success: true,
          jobId: job.id,
          userId,
          message: "Data submitted to ML pipeline",
        };
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        throw error;
      }
    });

    console.log("✓ Queue processor initialized");
  } catch (error) {
    console.error("Error initializing queue processor:", error);
    throw error;
  }
}

/**
 * Add a job to the queue
 */
