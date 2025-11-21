import { app } from "./app.js";
import { initializeQueueProcessor } from "./services/queue.processor.js";
import { generateKeys } from "./utils/generateKeys.js";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 3000;

initializeQueueProcessor();
generateKeys();

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});
