import { app } from "./app.js";
import { initializeQueueProcessor } from "./services/queue.processor.js";

const port = process.env.PORT || 3000;

initializeQueueProcessor();

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});
