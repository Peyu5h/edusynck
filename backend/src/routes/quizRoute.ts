import express from "express";
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
  generateQuestionsWithAI,
  getQuizProgress,
} from "../controllers/quizController.js";

const router = express.Router();

// Quiz management routes
router.post("/", createQuiz);
router.get("/course/:courseId", getQuizzesByCourse);
router.get("/active", getActiveQuizzesByCourse);
router.get("/:quizId", getQuizById);
router.put("/:quizId", updateQuiz);
router.delete("/:quizId", deleteQuiz);
router.post("/generate-questions", generateQuestionsApi);

// Quiz attempt routes
router.post("/:quizId/attempt", startQuizAttempt);
router.get("/attempt/:attemptId", getAttemptById);
router.get("/attempt/:attemptId/answers", getAttemptAnswers);
router.get("/attempt/:attemptId/results", getAttemptResults);
router.post("/attempt/:attemptId/answer", submitQuizAnswer);
router.post("/attempt/:attemptId/complete", completeQuizAttempt);
router.get("/:quizId/leaderboard", getQuizLeaderboard);
router.get("/student/:userId/attempts", getStudentQuizAttempts);

// Teacher quiz management routes
router.get("/:quizId/progress", getQuizProgress);

export default router;
