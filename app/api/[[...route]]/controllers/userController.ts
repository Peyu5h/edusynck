import {  format, differenceInDays } from "date-fns";
import { prisma } from "~/lib/prisma";
import { Context } from "hono";
import { success, err } from "../utils/response";
import { JsonValue } from "@prisma/client/runtime/library";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  activityLog: Array<{
    date: string;
    count: number;
  }>;
}

export const getUserById = async (c: Context) => {
  try {
    const userId = c.req.param("userId");

    if (!userId) {
      return c.json(err("User ID is required"), 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        assignments: true,
        wrongAnswers: true,
      },
    });

    if (!user) {
      return c.json(err("User not found"), 404);
    }

    const { password, ...userWithoutPassword } = user;

    const userData = {
      ...userWithoutPassword,
      courses:
        user.role === "STUDENT"
          ? user.class?.courses || []
          : user.role === "CLASS_TEACHER"
            ? user.taughtClasses.flatMap((c) => c.courses)
            : [],
    };

    return c.json(success(userData));
  } catch (error) {
    console.error("Error retrieving user:", error);
    return c.json(err("Server error"), 500);
  }
};

export const getUsers = async (c: Context) => {
  try {
    const role = c.req.query("role");
    const classId = c.req.query("classId");

    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (classId) {
      where.classId = classId;
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        class: {
          select: {
            name: true,
          },
        },
      },
    });

    const sanitizedUsers = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return c.json(success(sanitizedUsers));
  } catch (error) {
    console.error("Error retrieving users:", error);
    return c.json(err("Server error"), 500);
  }
};

export const updateUserStreak = async (c: Context) => {
  try {
    const userId = c.req.param("userId");

    if (!userId) {
      return c.json(err("User ID is required"), 400);
    }

    const today = format(new Date(), "yyyy-MM-dd");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        streak: true,
      },
    });

    if (!user) {
      return c.json(err("User not found"), 404);
    }

    let streak: StreakData = (user.streak as unknown as StreakData) || {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      activityLog: [],
    };

    const todayActivity = streak.activityLog?.find(
      (activity) => activity.date === today,
    );

    if (!todayActivity) {
      const updatedActivityLog = [
        ...(streak.activityLog || []),
        { date: today, count: 1 },
      ];

      let currentStreak = streak.currentStreak || 0;
      const lastActiveDate = streak.lastActiveDate
        ? new Date(streak.lastActiveDate)
        : null;

      if (lastActiveDate) {
        const daysSinceLastActive = differenceInDays(
          new Date(),
          lastActiveDate,
        );

        // If last active was yesterday, increment streak
        if (daysSinceLastActive === 1) {
          currentStreak += 1;
        }
        // If last active was not yesterday, reset streak to 1
        else if (daysSinceLastActive > 1) {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }

      const longestStreak = Math.max(currentStreak, streak.longestStreak || 0);

      const updatedStreak: StreakData = {
        currentStreak,
        longestStreak,
        lastActiveDate: today,
        activityLog: updatedActivityLog,
      };

      await prisma.user.update({
        where: { id: userId },
        data: { streak: updatedStreak as unknown as JsonValue },
      });

      return c.json(success(updatedStreak));
    }

    return c.json({ streak, message: "Streak already updated today" });
  } catch (error) {
    console.error("Error updating user streak:", error);
    return c.json(err("Server error"), 500);
  }
};
