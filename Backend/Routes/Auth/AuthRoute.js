import express from "express";
import { login,init } from "../../Controller/index.js";
const router = express.Router();
router.get("/init", init);
router.post("/login", login);

export { router as authRouter };