import prisma from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {
  loginSchema,
  registerSchema,
  teacherRegisterSchema,
} from "../utils/Validation.js";
import { UserRole } from "@prisma/client";

export const register = async (req, res) => {
  try {
    const validatedCredentials = await registerSchema.validate(req.body);

    const { name, email, password, classNumber } = validatedCredentials;

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const classExists = await prisma.class.findUnique({
      where: { classNumber: classNumber },
    });

    if (!classExists) {
      return res.status(400).json({ error: "Class not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        classId: classExists.id,
      },
      include: {
        class: {
          include: {
            courses: true,
          },
        },
        notifications: true,
        assignments: true,
        votedPolls: true,
        createdPolls: true,
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "10y",
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: "success",
      token,
      user: {
        ...userWithoutPassword,
        courseId: user.class.courses[0]?.id,
        googleClassroomId: user.class.courses[0]?.googleClassroomId,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "failed", message: error.message });
  }
};

export const registerTeacher = async (req, res) => {
  try {
    const validatedCredentials = await teacherRegisterSchema.validate(req.body);

    const { name, email, password, classNumber, role } = validatedCredentials;

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const classExists = await prisma.class.findUnique({
      where: { classNumber: classNumber },
    });

    if (!classExists) {
      return res.status(400).json({ error: "Class not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create teacher user with explicitly set string role
    const teacher = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CLASS_TEACHER", // Use string instead of enum for consistency
        taughtClasses: {
          connect: {
            id: classExists.id,
          },
        },
      },
    });

    // Update class with teacher
    await prisma.class.update({
      where: {
        id: classExists.id,
      },
      data: {
        teacherId: teacher.id,
      },
    });

    const token = jwt.sign({ userId: teacher.id }, process.env.JWT_SECRET, {
      expiresIn: "10y",
    });

    const { password: _, ...teacherWithoutPassword } = teacher;

    res.status(201).json({
      message: "success",
      token,
      user: teacherWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ error: "failed", message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const validatedCredentials = await loginSchema.validate(req.body);

    const { email, password } = validatedCredentials;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        class: {
          include: {
            courses: true,
          },
        },
        taughtClasses: {
          include: {
            courses: true,
            students: true,
          },
        },
        notifications: true,
        assignments: true,
        votedPolls: true,
        createdPolls: true,
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const { password: _, ...userWithoutPassword } = user;

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "10y",
    });

    // Log the user role for debugging
    console.log("User login - Role:", user.role);

    // Use string comparison for consistent behavior across frontend and backend
    if (user.role === "CLASS_TEACHER") {
      console.log("Sending class teacher response");
      res.status(200).json({
        message: "success",
        token,
        user: userWithoutPassword,
      });
    } else {
      console.log("Sending regular user response");
      res.status(200).json({
        message: "success",
        token,
        user: {
          ...userWithoutPassword,
          courseId: user.class?.courses[0]?.id,
          googleClassroomId: user.class?.courses[0]?.googleClassroomId,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ error: "failed", message: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        class: true,
        notifications: true,
        assignments: true,
        votedPolls: true,
        createdPolls: true,
        taughtClasses: {
          include: {
            courses: true,
            students: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ message: "Something went wrog" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        class: {
          include: {
            courses: true,
          },
        },
        taughtClasses: {
          include: {
            courses: true,
            students: true,
          },
        },
        notifications: true,
        assignments: true,
        votedPolls: true,
        createdPolls: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    // Send different response based on role
    if (user.role === "CLASS_TEACHER") {
      res.status(200).json(userWithoutPassword);
    } else {
      res.status(200).json({
        ...userWithoutPassword,
        courseId: user.class?.courses[0]?.id,
        googleClassroomId: user.class?.courses[0]?.googleClassroomId,
      });
    }
  } catch (error) {
    console.error("Error getting current user:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    res
      .status(500)
      .json({ error: "Failed to get user", message: error.message });
  }
};
