import { Request, Response } from "express";
import prisma from "../config/db.js";
import { UserRole } from "@prisma/client";
import { isToday, parse, format, differenceInDays } from "date-fns";

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

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
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
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
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

    return res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error("Error retrieving user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, classId } = req.query;

    const where: any = {};

    if (role) {
      where.role = role as string;
    }

    if (classId) {
      where.classId = classId as string;
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

    return res.status(200).json({
      success: true,
      data: sanitizedUsers,
    });
  } catch (error) {
    console.error("Error retrieving users:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateUserStreak = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
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
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
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
        //@ts-ignore -...
        data: { streak: updatedStreak },
      });

      return res.status(200).json({
        success: true,
        data: updatedStreak,
      });
    }

    // User has already logged in today
    return res.status(200).json({
      success: true,
      data: streak,
      message: "Streak already updated today",
    });
  } catch (error) {
    console.error("Error updating user streak:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
