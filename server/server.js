import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from './routes/authRoutes.js';
import vaultRoutes from './routes/vaultRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import rateLimit from 'express-rate-limit';

const envFile = process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev";
dotenv.config({ path: envFile, quiet: true });
dotenv.config({ quiet: true }); // Fallback to standard .env

// ENV VALIDATION: Fail fast if required environment variables are missing
const requiredEnvVars = ['JWT_SECRET', 'MONGO_URI', 'ENCRYPTION_KEY'];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
  console.error(
    `FATAL: Missing required environment variables at boot: ${missingEnvVars.join(', ')}`
  );
  process.exit(1);
}

// Connect to database
connectDB();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 200,
  message: { message: 'Too many requests, please try again later.' },
});

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true, // Allow cookies over CORS
  })
);
app.use(express.json());
app.use(cookieParser());

// JSON parse error handler
app.use((err, req, res, next) => {
  if (err && err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  next(err);
});

app.use(limiter);

// API Routes
app.get("/", (req, res) => {
  res.send("Welcome to the Team Vault API!");
});

app.use('/api/auth', authRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/teams', teamRoutes); // Aliased plural route
app.use('/api/vault', vaultRoutes); // Deprecated legacy route

// 404 and Centralized Error Handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));