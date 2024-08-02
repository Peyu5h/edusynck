import express from "express";
import trimrRequest from "trim-request";
import { login, register } from "../controllers/authController.js";
import {
  assignCourse,
  create,
  getCourses,
} from "../controllers/classController.js";
import { googleAuthMiddleware } from "../middlewares/googleAuthMiddleware.js";

const router = express.Router();
router.route("/create").post(trimrRequest.all, create);
router
  .route("/:classId/assign-courses")
  .post(trimrRequest.all, googleAuthMiddleware, assignCourse);
router.route("/:classId/courses").get(trimrRequest.all, getCourses);

export default router;
