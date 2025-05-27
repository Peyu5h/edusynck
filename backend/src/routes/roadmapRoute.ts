import express from "express";
import {
  generateRoadmap,
  getUserRoadmaps,
  getRoadmapById,
  updateTopicStatus,
  archiveRoadmap,
  regenerateRoadmap,
} from "../controllers/roadmapController.js";

const router = express.Router();

// Roadmap routes
router.post("/generate/:userId", generateRoadmap);
router.get("/user/:userId", getUserRoadmaps);
router.get("/:id", getRoadmapById);
router.patch("/topic/:id/status", updateTopicStatus);
router.patch("/:id/archive", archiveRoadmap);
router.post("/:id/regenerate", regenerateRoadmap);

export default router;
