import { Request, Response } from "express";
import prisma from "../config/db.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY as string);

export const createQuiz = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      courseId,
      questions,
      status,
      startTime,
      endTime,
      duration,
      isAiGenerated,
      contentForAi,
    } = req.body;

    const userId = req.body.userId;
    if (!title || !courseId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Title, course ID, and user ID are required",
      });
    }

    let quizQuestions = questions;
    if (isAiGenerated && contentForAi) {
      try {
        quizQuestions = await generateQuestionsWithAI(contentForAi);
      } catch (aiError) {
        console.error("Error generating questions with AI:", aiError);
        return res.status(500).json({
          success: false,
          message: "Failed to generate questions with AI",
        });
      }
    } else if (
      !questions ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Questions are required for manual quiz creation",
      });
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        courseId,
        createdBy: userId,
        status: status || "ACTIVE",
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        duration: duration || null,
        isAiGenerated: !!isAiGenerated,
        questions: {
          create: quizQuestions.map((q: any, index: number) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            order: index,
            points: q.points || 1,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create quiz",
    });
  }
};

export const getQuizzesByCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const quizzes = await prisma.quiz.findMany({
      where: { courseId },
      include: {
        _count: {
          select: { questions: true, studentAttempts: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: quizzes,
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch quizzes",
    });
  }
};

export const getQuizById = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const userId = req.query.userId as string;

    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: "Quiz ID is required",
      });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
        course: {
          select: { name: true },
        },
        creator: {
          select: { name: true },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    let studentAttempt = null;
    if (userId && quiz.status === "ACTIVE") {
      studentAttempt = await prisma.studentQuizAttempt.findFirst({
        where: {
          quizId,
          userId,
          status: { in: ["IN_PROGRESS", "COMPLETED"] },
        },
      });

      if (studentAttempt?.status !== "COMPLETED") {
        quiz.questions.forEach((q) => {
          // @ts-ignore - intentionally hiding this property
          q.correctAnswer = undefined;
        });
      }
    }

    return res.status(200).json({
      ...quiz,
      hasAttempted: !!studentAttempt,
      attemptStatus: studentAttempt?.status || null,
    });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch quiz",
    });
  }
};

export const updateQuiz = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const {
      title,
      description,
      status,
      startTime,
      endTime,
      duration,
      questions,
    } = req.body;

    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: "Quiz ID is required",
      });
    }

    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!existingQuiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        title: title || undefined,
        description: description !== undefined ? description : undefined,
        status: status || undefined,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        duration: duration !== undefined ? duration : undefined,
      },
    });

    if (questions && Array.isArray(questions)) {
      // Delete existing questions
      await prisma.quizQuestion.deleteMany({
        where: { quizId },
      });

      await prisma.quizQuestion.createMany({
        data: questions.map((q: any, index: number) => ({
          quizId,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          order: index,
          points: q.points || 1,
        })),
      });
    }

    const updatedQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    return res.status(200).json({
      success: true,
      data: updatedQuiz,
    });
  } catch (error) {
    console.error("Error updating quiz:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update quiz",
    });
  }
};

export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;

    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: "Quiz ID is required",
      });
    }

    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!existingQuiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    await prisma.quiz.delete({
      where: { id: quizId },
    });

    return res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete quiz",
    });
  }
};

export const startQuizAttempt = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const { userId } = req.body;

    if (!quizId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Quiz ID and user ID are required",
      });
    }

    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
        status: "ACTIVE",
        startTime: { lte: new Date() },
        endTime: { gte: new Date() },
      },
      include: { questions: true },
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found or not currently active",
      });
    }

    const existingAttempt = await prisma.studentQuizAttempt.findFirst({
      where: {
        quizId,
        userId,
        status: { in: ["IN_PROGRESS", "COMPLETED"] },
      },
    });

    if (existingAttempt) {
      if (existingAttempt.status === "COMPLETED") {
        return res.status(400).json({
          success: false,
          message: "You have already completed this quiz",
        });
      }

      return res.status(200).json(existingAttempt);
    }

    const attempt = await prisma.studentQuizAttempt.create({
      data: {
        quizId,
        userId,
        status: "IN_PROGRESS",
      },
    });

    return res.status(200).json(attempt);
  } catch (error) {
    console.error("Error starting quiz attempt:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to start quiz attempt",
    });
  }
};

export const submitQuizAnswer = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedOption } = req.body;

    if (!attemptId || !questionId || selectedOption === undefined) {
      return res.status(400).json({
        success: false,
        message: "Attempt ID, question ID, and selected option are required",
      });
    }

    const attempt = await prisma.studentQuizAttempt.findFirst({
      where: {
        id: attemptId,
        status: "IN_PROGRESS",
      },
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found or already completed",
      });
    }

    const question = await prisma.quizQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const existingAnswer = await prisma.studentQuestionAnswer.findFirst({
      where: {
        questionId,
        studentAttemptId: attemptId,
      },
    });

    const isCorrect = selectedOption === question.correctAnswer;

    if (existingAnswer) {
      await prisma.studentQuestionAnswer.update({
        where: { id: existingAnswer.id },
        data: {
          selectedOption,
          isCorrect,
          answeredAt: new Date(),
        },
      });
    } else {
      await prisma.studentQuestionAnswer.create({
        data: {
          questionId,
          studentAttemptId: attemptId,
          selectedOption,
          isCorrect,
          answeredAt: new Date(),
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Answer submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit answer",
    });
  }
};

export const completeQuizAttempt = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message: "Attempt ID is required",
      });
    }

    const attempt = await prisma.studentQuizAttempt.findFirst({
      where: {
        id: attemptId,
        status: "IN_PROGRESS",
      },
      include: {
        quiz: {
          include: {
            questions: true,
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found or already completed",
      });
    }

    let score = 0;
    const answeredQuestions = new Set(attempt.answers.map((a) => a.questionId));

    for (const answer of attempt.answers) {
      const question = attempt.quiz.questions.find(
        (q) => q.id === answer.questionId,
      );
      if (question && answer.isCorrect) {
        score += question.points;
      }
    }

    const completedAttempt = await prisma.studentQuizAttempt.update({
      where: { id: attemptId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        score,
      },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    return res.status(200).json(completedAttempt);
  } catch (error) {
    console.error("Error completing quiz attempt:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to complete quiz attempt",
    });
  }
};

export const getQuizLeaderboard = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;

    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: "Quiz ID is required",
      });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { id: true, title: true },
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const attempts = await prisma.studentQuizAttempt.findMany({
      where: {
        quizId,
        status: "COMPLETED",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ score: "desc" }, { completedAt: "asc" }],
    });

    const leaderboard = attempts.map((attempt, index) => {
      const completionTimeMs =
        attempt.completedAt && attempt.startedAt
          ? attempt.completedAt.getTime() - attempt.startedAt.getTime()
          : 0;

      return {
        rank: index + 1,
        userId: attempt.userId,
        name: attempt.user.name,
        email: attempt.user.email,
        score: attempt.score,
        completionTimeMs,
        formattedTime: `${Math.floor(completionTimeMs / 60000)}m ${Math.floor((completionTimeMs % 60000) / 1000)}s`,
        submittedAt: attempt.completedAt,
      };
    });

    return res.status(200).json({
      success: true,
      quiz,
      leaderboard,
    });
  } catch (error) {
    console.error("Error fetching quiz leaderboard:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch quiz leaderboard",
    });
  }
};

export const getStudentQuizAttempts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const attempts = await prisma.studentQuizAttempt.findMany({
      where: {
        userId,
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            status: true,
            duration: true,
            course: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: attempts,
    });
  } catch (error) {
    console.error("Error fetching student attempts:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student attempts",
    });
  }
};

export async function generateQuestionsWithAI(content: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    const prompt = `Based on the following content, generate 5 multiple-choice questions (MCQs) for a quiz. Each question should have 4 options, with only one correct answer. Format the output as a valid JSON array of objects, like this:

    [
      {
        "question": "Question text here",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswer": 0,
        "points": 1
      },
      // ... (4 more questions in the same format)
    ]

    The 'correctAnswer' field should be the index (0-3) of the correct option.

    Content:
    ${content}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Unable to extract valid JSON from the AI response");
    }
  } catch (error) {
    console.error("AI question generation error:", error);
    throw error;
  }
}

export const generateQuestionsApi = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required for generating questions",
      });
    }

    const questions = await generateQuestionsWithAI(content);
    return res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error("Error generating questions with AI:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate questions with AI",
    });
  }
};

export const getActiveQuizzesByCourse = async (req: Request, res: Response) => {
  try {
    const courseId = req.query.courseId as string;
    const userId = req.query.userId as string;

    const filters: any = {
      status: "ACTIVE",
      startTime: { lte: new Date() },
      endTime: { gte: new Date() },
    };

    if (courseId) {
      filters.courseId = courseId;
    }

    const quizzes = await prisma.quiz.findMany({
      where: filters,
      include: {
        _count: {
          select: { questions: true },
        },
        course: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let quizzesWithAttempts = quizzes;
    if (userId) {
      quizzesWithAttempts = await Promise.all(
        quizzes.map(async (quiz) => {
          const attempt = await prisma.studentQuizAttempt.findFirst({
            where: {
              quizId: quiz.id,
              userId,
            },
            select: {
              id: true,
              status: true,
            },
          });

          return {
            ...quiz,
            hasAttempted: !!attempt,
            attemptStatus: attempt?.status || null,
          };
        }),
      );
    }

    return res.status(200).json({
      success: true,
      data: quizzesWithAttempts,
    });
  } catch (error) {
    console.error("Error fetching active quizzes:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch active quizzes",
    });
  }
};

export const getAttemptById = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message: "Attempt ID is required",
      });
    }

    const attempt = await prisma.studentQuizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          select: {
            title: true,
            description: true,
            duration: true,
            course: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    return res.status(200).json(attempt);
  } catch (error) {
    console.error("Error fetching attempt:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch attempt",
    });
  }
};

export const getAttemptAnswers = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message: "Attempt ID is required",
      });
    }

    const answers = await prisma.studentQuestionAnswer.findMany({
      where: { studentAttemptId: attemptId },
      select: {
        id: true,
        questionId: true,
        selectedOption: true,
      },
    });

    return res.status(200).json({
      success: true,
      answers,
    });
  } catch (error) {
    console.error("Error fetching attempt answers:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch attempt answers",
    });
  }
};

export const getAttemptResults = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message: "Attempt ID is required",
      });
    }

    const attempt = await prisma.studentQuizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
        quiz: {
          include: {
            questions: true,
            course: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    if (attempt.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "This attempt has not been completed yet",
      });
    }

    return res.status(200).json(attempt);
  } catch (error) {
    console.error("Error fetching attempt results:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch attempt results",
    });
  }
};

export const getQuizProgress = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;

    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: "Quiz ID is required",
      });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        course: true,
      },
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const enrolledStudents = await prisma.user.findMany({
      where: {
        classId: {
          not: null,
        },
        class: {
          courses: {
            some: {
              id: quiz.courseId,
            },
          },
        },
        role: "STUDENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const attempts = await prisma.studentQuizAttempt.findMany({
      where: {
        quizId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const studentProgress = enrolledStudents.map((student) => {
      const studentAttempts = attempts.filter(
        (attempt) => attempt.userId === student.id,
      );
      const latestAttempt =
        studentAttempts.length > 0
          ? studentAttempts.reduce((latest, current) =>
              new Date(current.startedAt) > new Date(latest.startedAt)
                ? current
                : latest,
            )
          : null;

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        hasAttempted: studentAttempts.length > 0,
        attemptId: latestAttempt?.id || undefined,
        score: latestAttempt?.score,
        completedAt: latestAttempt?.completedAt,
        status: latestAttempt?.status,
      };
    });

    const attempted = attempts.filter(
      (attempt, index, self) =>
        index === self.findIndex((a) => a.userId === attempt.userId),
    ).length;

    const completed = attempts.filter((a) => a.status === "COMPLETED").length;

    const completedAttempts = attempts.filter(
      (attempt) => attempt.status === "COMPLETED",
    );

    const scores = completedAttempts.map((a) => a.score);
    const averageScore =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

    const progress = {
      attempted,
      completed,
      totalStudents: enrolledStudents.length,
      averageScore,
      highestScore,
      lowestScore,
    };

    return res.status(200).json({
      success: true,
      students: studentProgress,
      progress,
    });
  } catch (error) {
    console.error("Error fetching quiz progress:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch quiz progress",
    });
  }
};
