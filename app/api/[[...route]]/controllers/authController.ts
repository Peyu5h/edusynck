import { Context } from "hono";
import { prisma } from "~/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  registerSchema,
  loginSchema,
  teacherRegisterSchema,
  type RegisterInput,
  type LoginInput,
  type TeacherRegisterInput,
} from "../schemas/auth.schema";

export const register = async (c: Context) => {
  try {
    const body = await c.req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return c.json(
        { error: "Validation failed", message: result.error.message },
        400,
      );
    }

    const { name, email, password, classNumber } = result.data;

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return c.json({ error: "User already exists" }, 400);
    }

    const classExists = await prisma.class.findUnique({
      where: { classNumber },
    });

    if (!classExists) {
      return c.json({ error: "Class not found" }, 400);
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

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "10y",
    });

    const { password: _, ...userWithoutPassword } = user;

    return c.json(
      {
        message: "success",
        token,
        user: {
          ...userWithoutPassword,
          courseId: user.class?.courses[0]?.id,
          googleClassroomId: user.class?.courses[0]?.googleClassroomId,
        },
      },
      201,
    );
  } catch (error) {
    console.error("Registration error:", error);
    return c.json(
      {
        error: "failed",
        message: error instanceof Error ? error.message : "Registration failed",
      },
      500,
    );
  }
};

export const registerTeacher = async (c: Context) => {
  try {
    const body = await c.req.json();
    const result = teacherRegisterSchema.safeParse(body);

    if (!result.success) {
      return c.json(
        { error: "Validation failed", message: result.error.message },
        400,
      );
    }

    const { name, email, password, classNumber } = result.data;

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return c.json({ error: "User already exists" }, 400);
    }

    const classExists = await prisma.class.findUnique({
      where: { classNumber },
    });

    if (!classExists) {
      return c.json({ error: "Class not found" }, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CLASS_TEACHER",
        taughtClasses: {
          connect: {
            id: classExists.id,
          },
        },
      },
    });

    await prisma.class.update({
      where: {
        id: classExists.id,
      },
      data: {
        teacherId: teacher.id,
      },
    });

    const token = jwt.sign({ userId: teacher.id }, process.env.JWT_SECRET!, {
      expiresIn: "10y",
    });

    const { password: _, ...teacherWithoutPassword } = teacher;

    return c.json(
      {
        message: "success",
        token,
        user: teacherWithoutPassword,
      },
      201,
    );
  } catch (error) {
    console.error("Teacher registration error:", error);
    return c.json(
      {
        error: "failed",
        message: error instanceof Error ? error.message : "Registration failed",
      },
      500,
    );
  }
};

export const login = async (c: Context) => {
  try {
    console.log(`Login request received via ${c.req.method}`);

    let email, password;

    // Handle both GET and POST methods
    if (c.req.method === "GET") {
      email = c.req.query("email");
      password = c.req.query("password");

      console.log("GET login params:", {
        email: email ? "provided" : "missing",
        password: password ? "provided" : "missing",
      });

      if (!email || !password) {
        return c.json(
          {
            error: "Validation failed",
            message: "Email and password are required",
          },
          400,
        );
      }
    } else {
      // For POST requests
      try {
        const body = await c.req.json();
        console.log("POST login body received");

        const result = loginSchema.safeParse(body);

        if (!result.success) {
          console.log("Login validation failed:", result.error.message);
          return c.json(
            { error: "Validation failed", message: result.error.message },
            400,
          );
        }

        email = result.data.email;
        password = result.data.password;
      } catch (e) {
        console.error("Error parsing login request:", e);

        // If JSON parsing fails, try to get from query params as fallback
        email = c.req.query("email");
        password = c.req.query("password");

        console.log("Fallback to query params:", {
          email: email ? "provided" : "missing",
          password: password ? "provided" : "missing",
        });

        if (!email || !password) {
          return c.json(
            { error: "Validation failed", message: "Invalid request format" },
            400,
          );
        }
      }
    }

    // Debug log to see if we got this far with valid credentials
    console.log(`Attempting to authenticate: ${email}`);

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
      console.log(`Login failed: User with email ${email} not found`);
      return c.json({ error: "Invalid email or password" }, 400);
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      console.log(`Login failed: Invalid password for user ${email}`);
      return c.json({ error: "Invalid email or password" }, 400);
    }

    console.log(`Login successful for user ${email}`);

    const { password: _, ...userWithoutPassword } = user;

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "10y",
    });

    if (user.role === "CLASS_TEACHER") {
      return c.json({
        message: "success",
        token,
        user: userWithoutPassword,
      });
    }

    return c.json({
      message: "success",
      token,
      user: {
        ...userWithoutPassword,
        courseId: user.class?.courses[0]?.id,
        googleClassroomId: user.class?.courses[0]?.googleClassroomId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json(
      {
        error: "failed",
        message: error instanceof Error ? error.message : "Login failed",
      },
      500,
    );
  }
};

export const getCurrentUser = async (c: Context) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "No token provided" }, 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    if (!decoded.userId) {
      return c.json({ error: "Invalid token" }, 401);
    }

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
      return c.json({ error: "User not found" }, 404);
    }

    const { password, ...userWithoutPassword } = user;

    if (user.role === "CLASS_TEACHER") {
      return c.json(userWithoutPassword);
    }

    return c.json({
      ...userWithoutPassword,
      courseId: user.class?.courses[0]?.id,
      googleClassroomId: user.class?.courses[0]?.googleClassroomId,
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return c.json({ error: "Invalid token" }, 401);
    }
    return c.json(
      {
        error: "Failed to get user",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
};

export const getUser = async (c: Context) => {
  try {
    console.log(`getUser request received via ${c.req.method}`);

    let userId;

    // Handle both GET and POST methods
    if (c.req.method === "GET") {
      userId = c.req.query("userId");
      console.log("GET getUser params:", { userId: userId || "missing" });
    } else {
      // For POST requests
      try {
        const body = await c.req.json();
        console.log("POST getUser body received");
        userId = body.userId;
      } catch (e) {
        console.error("Error parsing getUser request body:", e);
        // If JSON parsing fails, try to get from query params as fallback
        userId = c.req.query("userId");
        console.log("Fallback to query params:", {
          userId: userId || "missing",
        });
      }
    }

    if (!userId) {
      return c.json({ error: "User ID is required" }, 400);
    }

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
      return c.json({ error: "User not found" }, 404);
    }

    const { password, ...userWithoutPassword } = user;
    return c.json(userWithoutPassword);
  } catch (error) {
    console.error("Error getting user:", error);
    return c.json(
      {
        error: "Failed to get user",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
};
