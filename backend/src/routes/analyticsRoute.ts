import express from "express";
import {
  saveWrongAnswers,
  getWrongAnswersByUser,
} from "../controllers/analyticsController.js";

const router = express.Router();

// Wrong answers routes
router.post("/wrong-answers", saveWrongAnswers);
router.get("/wrong-answers/:userId", getWrongAnswersByUser);

export default router;
