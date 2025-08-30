import "dotenv/config";
import express from "express";
import cors from "cors";
import { env } from "./env";
import { healthRouter } from "./routes/health";
import { authRouter } from "./routes/auth";
import { projectsRouter } from "./routes/projects";
import { ticketsRouter } from "./routes/tickets";
import { commentsRouter } from "./routes/comments";

const app = express();
app.use(cors());
app.use(express.json());

app.use(healthRouter);
app.use(authRouter);
app.use(projectsRouter);
app.use(ticketsRouter);
app.use(commentsRouter);
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});



