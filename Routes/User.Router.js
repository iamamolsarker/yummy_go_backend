import express from "express";
import { createUser } from "../Controllers/user.controller.js";

const router = express.Router();

router.post("/", createUser);

export default router;
