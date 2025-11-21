import { generateKeys } from "./utils/generateKeys.js";
generateKeys();

import dotenv from "dotenv";
dotenv.config({ quiet: true });

import { app } from "./app.js";
import { initializeQueueProcessor } from "./services/queue.processor.js";

const port = process.env.PORT || 3000;

initializeQueueProcessor();

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
