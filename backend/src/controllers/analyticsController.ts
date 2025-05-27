import prisma from "../config/db.js";

export const saveWrongAnswers = async (req, res) => {
  try {
    const { userId, wrongAnswers } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!wrongAnswers || !Array.isArray(wrongAnswers)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wrong answers data",
      });
    }

    // Allow empty array (just log it)
    if (wrongAnswers.length === 0) {
      console.log("Received empty wrong answers array for user:", userId);
      return res.status(200).json({
        success: true,
        message: "No wrong answers to save",
        data: [],
      });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
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

    return res.status(201).json({
      success: true,
      message: "Wrong answers saved successfully",
      data: createdWrongAnswers,
    });
  } catch (error) {
    console.error("Error saving wrong answers:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save wrong answers",
      error: error.message,
    });
  }
};

/**
 * Get wrong answers by user ID
 * @route GET /api/analytics/wrong-answers/:userId
 */
export const getWrongAnswersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get wrong answers for the user
    const wrongAnswers = await prisma.wrongAnswer.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: wrongAnswers,
    });
  } catch (error) {
    console.error("Error retrieving wrong answers:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve wrong answers",
      error: error.message,
    });
  }
};
