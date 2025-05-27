import { Hono } from "hono";
import {
  assignCourse,
  create,
  getAssignments,
  getCourses,
  getMaterials,
  getOneCourse,
  getOneMaterial,
} from "../controllers/classController";
import { googleAuthMiddleware } from "../middlewares/googleAuthMiddleware";

const classRoutes = new Hono();

classRoutes.post("/create", create);
classRoutes.post(
  "/:classId/assign-courses",
  googleAuthMiddleware,
  assignCourse,
);
classRoutes.get("/:classId/courses", googleAuthMiddleware, getCourses);
classRoutes.get(
  "/:classId/course/:courseId/assignments",
  googleAuthMiddleware,
  getAssignments,
);
classRoutes.get(
  "/:classId/course/:courseId/materials",
  googleAuthMiddleware,
  getMaterials,
);
classRoutes.get(
  "/:classId/course/:courseId/material/:materialId",
  googleAuthMiddleware,
  getOneMaterial,
);
classRoutes.get("/:courseId", getOneCourse);

export default classRoutes;
