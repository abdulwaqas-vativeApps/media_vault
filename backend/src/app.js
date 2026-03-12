import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import env from "./config/env.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { ApiError } from "./utils/ApiError.js";
import { GlobalErrorHandler } from "./middlewares/ErrorMiddleware.js";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// Load YAML
const swaggerDocument = YAML.load("./src/swagger/api-docs.yaml");

// Swagger UI route
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api", routes);

app.use((req, res, next) => {
  next(new ApiError(404, "Route not found"));
});

app.use(GlobalErrorHandler);

export default app;
