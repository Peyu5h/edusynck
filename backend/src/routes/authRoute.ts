import express from "express";
import trimrRequest from "trim-request";
import {
  getUser,
  login,
  register,
  registerTeacher,
  getCurrentUser,
} from "../controllers/authController.js";

const router = express.Router();
router.route("/register").post(trimrRequest.all, register);
router.route("/register-teacher").post(trimrRequest.all, registerTeacher);
router.route("/login").post(trimrRequest.all, login);
router.route("/getUser").post(trimrRequest.all, getUser);
router.route("/me").get(trimrRequest.all, getCurrentUser);

export default router;
