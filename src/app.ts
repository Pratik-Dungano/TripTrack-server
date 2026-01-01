import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import type MessageResponse from "./interfaces/message-response";
import api from "./api/index";
import * as middlewares from "./middlewares";
import { apiLimiter } from "./middlewares/rateLimiter";

const app = express();

app.use(morgan("dev"));
app.use(helmet());
// CORS configuration - allow Vercel and localhost
const corsOrigins = process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3001", "http://localhost:3000"];
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
app.use(express.json());

// Apply rate limit to all API routes
app.use("/api/v1", apiLimiter);

app.get<object, MessageResponse>("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

app.use("/api/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
