import { generateKeys } from "./utils/generateKeys.js";
generateKeys();

import dotenv from "dotenv";
dotenv.config({ quiet: true });

import { app } from "./app.js";
import { initializeQueueProcessor } from "./services/queue.processor.js";

const port = process.env.PORT || 3000;

// Initialize queue processor, but don't block server startup if Redis is unavailable
initializeQueueProcessor().catch((error) => {
  console.error(
    "Warning: Queue processor failed to initialize (Redis may not be running):",
    error.message
  );
  console.error(
    "HTTP endpoints will still work, but job queue will not be available"
  );
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
