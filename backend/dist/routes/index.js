import express from "express";
import authRoute from "./authRoute.js";
import adminOnlyRoute from "./adminOnlyRoute.js";
import classRoute from "./classRoute.js";
const router = express.Router();
router.use("/auth", authRoute);
router.use("/admin", adminOnlyRoute);
router.use("/class", classRoute);
export default router;
