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

adminRoutes.get("/oauth2callback", oauth2callback);
adminRoutes.get("/auth", auth);
adminRoutes.get("/file/:fileId", googleAuthMiddleware, getFile);
adminRoutes.get("/debug", debugFileSystem);
adminRoutes.get("/convert2PDF", extractTextFromPptxUrl);
adminRoutes.get("/image", googleAuthMiddleware, getImage);
adminRoutes.get(
  "/class/:classId/assignments",
  googleAuthMiddleware,
  getAllAssignments,
);
adminRoutes.get("/all-courses", googleAuthMiddleware, allCourses);
adminRoutes.post("/youtube", googleAuthMiddleware, getYoutubeVideos);

export default adminRoutes;
