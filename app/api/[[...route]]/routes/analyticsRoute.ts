import { Hono } from "hono";
import {
  saveWrongAnswers,
  getWrongAnswersByUser,
} from "../controllers/analyticsController";

const analyticsRoutes = new Hono();

// Wrong answers routes - support both GET and POST
analyticsRoutes.post("/wrong-answers", saveWrongAnswers);
analyticsRoutes.get("/wrong-answers", saveWrongAnswers); // Support GET for saving (e.g. from URL params)
analyticsRoutes.get("/wrong-answers/:userId", getWrongAnswersByUser);

export default analyticsRoutes;
