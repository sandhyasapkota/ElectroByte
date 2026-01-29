// app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import {
  productRoute,
  authRouter,
  categoryRoute,
  brandRoute,
  appointmentRoute,
  feedbackRoute,
} from "./Routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", authRouter);
app.use("/api/products", productRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/brands", brandRoute);
app.use("/api/appointments", appointmentRoute);
app.use("/api/feedback", feedbackRoute);

export default app;
