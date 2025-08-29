import { Hono, Context, Next } from "hono";
import {
  assignCourse,
  create,
  deleteCourse,
  getAssignments,
  getCourses,
  getMaterials,
  getOneCourse,
  getOneMaterial,
  getGoogleClassroomCourses,
} from "../controllers/classController";
import { googleAuthMiddleware } from "../middlewares/googleAuthMiddleware";

const classRoutes = new Hono();

classRoutes.post("/create", create);
classRoutes.post(
  "/:classId/assign-courses",
  googleAuthMiddleware,
  assignCourse,
);
classRoutes.delete("/:classId/courses/:courseId", deleteCourse);
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
classRoutes.get(
  "/google-classroom/courses",
  googleAuthMiddleware,
  getGoogleClassroomCourses,
);

export default classRoutes;
