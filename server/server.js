import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db.js";
import authRoutes from './routes/authRoutes.js';
import vaultRoutes from './routes/vaultRoutes.js';
import rateLimit from 'express-rate-limit';



const envFile = process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev";
dotenv.config({ path: envFile, quiet: true  });

// Connect to database
connectDB();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  message: 'Too many requests, please try again later.',
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
// app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(cors());
app.use(express.json());

app.use(limiter);

// routes
app.get("/", (req, res) => {
  res.send("Welcome to the Team Vault API!");
});
app.use('/api/auth', authRoutes);
app.use('/api/vault', vaultRoutes);

//error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Internal server error' });
});

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));