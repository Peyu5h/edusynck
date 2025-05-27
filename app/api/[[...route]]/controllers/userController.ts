import { UserRole } from "@prisma/client";
import { isToday, parse, format, differenceInDays } from "date-fns";
import { prisma } from "~/lib/prisma";
import { Context } from "hono";
import { success, err } from "../utils/response";
import { JsonValue } from "@prisma/client/runtime/library";

// Define the streak interface
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

    // Make courses easily accessible in the response
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

    // Get the current date in YYYY-MM-DD format
    const today = format(new Date(), "yyyy-MM-dd");

    // Find the user and their current streak data
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

    // Default streak data if user doesn't have any
    let streak: StreakData = (user.streak as unknown as StreakData) || {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      activityLog: [],
    };

    // Check if the user has already logged in today
    const todayActivity = streak.activityLog?.find(
      (activity) => activity.date === today,
    );

    if (!todayActivity) {
      // If user hasn't logged in today, add today to their activity log
      const updatedActivityLog = [
        ...(streak.activityLog || []),
        { date: today, count: 1 },
      ];

      // Check if the user's last activity was yesterday to maintain the streak
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
        // First time user activity, set streak to 1
        currentStreak = 1;
      }

      // Update longest streak if needed
      const longestStreak = Math.max(currentStreak, streak.longestStreak || 0);

      // Update user's streak data
      const updatedStreak: StreakData = {
        currentStreak,
        longestStreak,
        lastActiveDate: today,
        activityLog: updatedActivityLog,
      };

      // Save the updated streak data
      await prisma.user.update({
        where: { id: userId },
        data: { streak: updatedStreak as unknown as JsonValue },
      });

      return c.json(success(updatedStreak));
    }

    // User has already logged in today
    return c.json({ streak, message: "Streak already updated today" });
  } catch (error) {
    console.error("Error updating user streak:", error);
    return c.json(err("Server error"), 500);
  }
};
