import { Hono } from "hono";
import {
  createQuiz,
  getQuizzesByCourse,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  startQuizAttempt,
  submitQuizAnswer,
  completeQuizAttempt,
  getQuizLeaderboard,
  getStudentQuizAttempts,
  generateQuestionsApi,
  getActiveQuizzesByCourse,
  getAttemptById,
  getAttemptAnswers,
  getAttemptResults,
  getQuizProgress,
} from "../controllers/quizController";

const quizRoutes = new Hono();

// Quiz management routes
quizRoutes.post("/", createQuiz);
quizRoutes.get("/course/:courseId", getQuizzesByCourse);
quizRoutes.get("/active", getActiveQuizzesByCourse);
quizRoutes.get("/:quizId", getQuizById);
quizRoutes.put("/:quizId", updateQuiz);
quizRoutes.delete("/:quizId", deleteQuiz);
quizRoutes.post("/generate-questions", generateQuestionsApi);

// Quiz attempt routes
quizRoutes.post("/:quizId/attempt", startQuizAttempt);
quizRoutes.get("/attempt/:attemptId", getAttemptById);
quizRoutes.get("/attempt/:attemptId/answers", getAttemptAnswers);
quizRoutes.get("/attempt/:attemptId/results", getAttemptResults);
quizRoutes.post("/attempt/:attemptId/answer", submitQuizAnswer);
quizRoutes.post("/attempt/:attemptId/complete", completeQuizAttempt);
quizRoutes.get("/:quizId/leaderboard", getQuizLeaderboard);
quizRoutes.get("/student/:userId/attempts", getStudentQuizAttempts);

// Teacher quiz management routes
quizRoutes.get("/:quizId/progress", getQuizProgress);

export default quizRoutes;
