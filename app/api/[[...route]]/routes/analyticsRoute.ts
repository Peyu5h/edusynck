import { Hono } from "hono";
import {
  saveWrongAnswers,
  getWrongAnswersByUser,
} from "../controllers/analyticsController";

const analyticsRoutes = new Hono();

// Wrong answers routes
analyticsRoutes.post("/wrong-answers", saveWrongAnswers);
analyticsRoutes.get("/wrong-answers/:userId", getWrongAnswersByUser);

export default analyticsRoutes;
