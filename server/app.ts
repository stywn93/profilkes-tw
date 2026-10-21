import "dotenv/config";
import cors from "cors";
import express from "express";
import { pool } from "./db.ts";
import populationRouter from "./routes/population.ts";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  }),
);
app.use(express.json());

app.get("/api/healthcheck", async (_request, response) => {
  try {
    await pool.query("SELECT 1");
    response.json({ status: "ok", database: "connected" });
  } catch {
    response.status(503).json({ status: "error", database: "unavailable" });
  }
});

app.use("/api/population", populationRouter);

app.use((_request, response) => {
  response.status(404).json({ error: "Not found" });
});

export default app;
