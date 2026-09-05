import express from "express";
import routes from "./routes/index.js";
import fs from "fs";
import path from "path";
import swaggerUi from "swagger-ui-express";

const app: express.Application = express();

app.use(express.json());

const swaggerFile = JSON.parse(
  fs.readFileSync(path.resolve("./swagger-output.json"), "utf8"),
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use("/api", routes);

export default app;
