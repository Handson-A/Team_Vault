import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db.js";
import authRoutes from './routes/authRoutes.js';



const envFile = process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev";
dotenv.config({ path: envFile });

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
// app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(cors());
app.use(express.json());


// routes
app.get("/", (req, res) => {
  res.send("Welcome to the Team Vault API!");
});
app.use('/api/auth', authRoutes);

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));