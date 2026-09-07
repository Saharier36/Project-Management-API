import app from "./app";
import { env } from "./config/env";

const port = Number(env.port) || 4000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
