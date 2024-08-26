import express from "express";
import trimrRequest from "trim-request";
import {
  assignCourse,
  create,
  getAssignments,
  getCourses,
  getMaterials,
  getOneCourse,
  getOneMaterial,
} from "../controllers/classController.js";
import { googleAuthMiddleware } from "../middlewares/googleAuthMiddleware.js";

const router = express.Router();
router.route("/create").post(trimrRequest.all, create);

router
  .route("/:classId/assign-courses")
  .post(trimrRequest.all, googleAuthMiddleware, assignCourse);

router
  .route("/:classId/courses")
  .get(trimrRequest.all, googleAuthMiddleware, getCourses);

router
  .route("/:classId/course/:courseId/assignments")
  .get(trimrRequest.all, googleAuthMiddleware, getAssignments);

router
  .route("/:classId/course/:courseId/materials")
  .get(trimrRequest.all, googleAuthMiddleware, getMaterials);
router
  .route("/:classId/course/:courseId/material/:materialId")
  .get(trimrRequest.all, googleAuthMiddleware, getOneMaterial);

router.route("/:courseId").get(getOneCourse);

export default router;
