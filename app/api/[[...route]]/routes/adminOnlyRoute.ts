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
} from "../controllers/adminOnlyController";
import { googleAuthMiddleware } from "../middlewares/googleAuthMiddleware";

const adminRoutes = new Hono();

adminRoutes.get("/oauth2callback", oauth2callback);
adminRoutes.get("/auth", auth);
adminRoutes.get("/file/:fileId", googleAuthMiddleware, getFile);
adminRoutes.get("/convert2PDF", extractTextFromPptxUrl);
adminRoutes.get("/image", googleAuthMiddleware, getImage);
adminRoutes.options("/image", (c) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  c.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  return c.text("", 200);
});
adminRoutes.get(
  "/class/:classId/assignments",
  googleAuthMiddleware,
  getAllAssignments,
);
adminRoutes.get("/all-courses", googleAuthMiddleware, allCourses);
adminRoutes.post("/youtube", googleAuthMiddleware, getYoutubeVideos);

export default adminRoutes;
