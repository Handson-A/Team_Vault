import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";


// Load environment variables   
const envFile =
  process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev";
dotenv.config({ path: envFile });

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


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));