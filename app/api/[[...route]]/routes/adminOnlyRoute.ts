import { Hono } from "hono";
import {
  allCourses,
  auth,
  getFile,
  getAllAssignments,
  oauth2callback,
  getImage,
  extractTextFromPptxUrl,
  getYoutubeVideos,
  debugFileSystem,
} from "../controllers/adminOnlyController";
import { googleAuthMiddleware } from "../middlewares/googleAuthMiddleware";

const adminRoutes = new Hono();

// Authentication routes
adminRoutes.get("/oauth2callback", oauth2callback);
adminRoutes.get("/auth", auth);

// File handling routes
adminRoutes.get("/file/:fileId", googleAuthMiddleware, getFile);
adminRoutes.get("/debug", debugFileSystem);
adminRoutes.get("/convert2PDF", extractTextFromPptxUrl);
adminRoutes.get("/image", googleAuthMiddleware, getImage);

// Course and assignment routes
adminRoutes.get(
  "/class/:classId/assignments",
  googleAuthMiddleware,
  getAllAssignments,
);
adminRoutes.get("/all-courses", googleAuthMiddleware, allCourses);

// YouTube API routes - allow both GET and POST
adminRoutes.post("/youtube", googleAuthMiddleware, getYoutubeVideos);
adminRoutes.get("/youtube", googleAuthMiddleware, getYoutubeVideos);

export default adminRoutes;
