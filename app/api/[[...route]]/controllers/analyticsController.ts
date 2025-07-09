import { Context } from "hono";
import { prisma } from "~/lib/prisma";

export const saveWrongAnswers = async (c: Context) => {
  try {
    const { userId, wrongAnswers } = await c.req.json();

    if (!userId) {
      return c.json(
        {
          success: false,
          message: "User ID is required",
        },
        400,
      );
    }

    if (!wrongAnswers || !Array.isArray(wrongAnswers)) {
      return c.json(
        {
          success: false,
          message: "Invalid wrong answers data",
        },
        400,
      );
    }

    // Allow empty array (just log it)
    if (wrongAnswers.length === 0) {
      console.log("Received empty wrong answers array for user:", userId);
      return c.json(
        {
          success: true,
          message: "No wrong answers to save",
          data: [],
        },
        200,
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return c.json(
        {
          success: false,
          message: "User not found",
        },
        404,
      );
    }

    // Create wrong answers records
    const createdWrongAnswers = await Promise.all(
      wrongAnswers.map(async (answer) => {
        // Sanitize data to prevent errors
        const sanitizedAnswer = {
          userId,
          question: String(answer.question || "").slice(0, 500), // Limit length
          userAnswer: String(answer.userAnswer || "").slice(0, 500),
          correctAnswer: String(answer.correctAnswer || "").slice(0, 500),
          materialName: String(answer.materialName || "Unknown Material").slice(
            0,
            100,
          ),
          courseName: answer.courseName
            ? String(answer.courseName).slice(0, 100)
            : null,
          courseId: answer.courseId || null,
        };

        return prisma.wrongAnswer.create({
          data: sanitizedAnswer,
        });
      }),
    );

    return c.json(
      {
        success: true,
        message: "Wrong answers saved successfully",
        data: createdWrongAnswers,
      },
      201,
    );
  } catch (error) {
    console.error("Error saving wrong answers:", error);
    return c.json(
      {
        success: false,
        message: "Failed to save wrong answers",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
};

/**
 * Get wrong answers by user ID
 * @route GET /api/analytics/wrong-answers/:userId
 */
export const getWrongAnswersByUser = async (c: Context) => {
  try {
    const userId = c.req.param("userId");

    if (!userId) {
      return c.json(
        {
          success: false,
          message: "User ID is required",
        },
        400,
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return c.json(
        {
          success: false,
          message: "User not found",
        },
        404,
      );
    }

    // Get wrong answers for the user
    const wrongAnswers = await prisma.wrongAnswer.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
    });

    return c.json(
      {
        success: true,
        data: wrongAnswers,
      },
      200,
    );
  } catch (error) {
    console.error("Error retrieving wrong answers:", error);
    return c.json(
      {
        success: false,
        message: "Failed to retrieve wrong answers",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
};
