import express from "express";
import trimRequest from "trim-request";
import {
  allCourses,
  auth,
  getFile,
  getAssignments,
  oauth2callback,
  getImage,
  extractTextFromPptxUrl,
} from "../controllers/adminOnlyController.js";
import { googleAuthMiddleware } from "../middlewares/googleAuthMiddleware.js";

const router = express.Router();

router.route("/oauth2callback").get(trimRequest.all, oauth2callback);
router.route("/auth").get(trimRequest.all, auth);
router
  .route("/file/:fileId")
  .get(trimRequest.all, googleAuthMiddleware, getFile);
router.route("/convert2PDF").get(trimRequest.all, extractTextFromPptxUrl);
router.route("/image").get(trimRequest.all, googleAuthMiddleware, getImage);
router
  .route("/:id/assignments")
  .get(trimRequest.all, googleAuthMiddleware, getAssignments);
router
  .route("/all-courses")
  .get(trimRequest.all, googleAuthMiddleware, allCourses);

export default router;
