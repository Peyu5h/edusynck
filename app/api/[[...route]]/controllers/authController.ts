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
    const body = await c.req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return c.json(
        { error: "Validation failed", message: result.error.message },
        400,
      );
    }

    const { email, password } = result.data;

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
      return c.json({ error: "Invalid email or password" }, 400);
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return c.json({ error: "Invalid email or password" }, 400);
    }

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
