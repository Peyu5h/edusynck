import express from "express";
import trimrRequest from "trim-request";
import { getUser, login, register } from "../controllers/authController.js";
const router = express.Router();
router.route("/register").post(trimrRequest.all, register);
router.route("/login").post(trimrRequest.all, login);
router.route("/getUser").get(trimrRequest.all, getUser);
export default router;
