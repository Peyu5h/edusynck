import { Context } from "hono";
import { Prisma } from "@prisma/client";
import { prisma } from "~/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const createQuiz = async (c: Context) => {
  try {
    const body = await c.req.json();
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
      userId,
    } = body;

    if (!title || !courseId || !userId) {
      return c.json(
        {
          success: false,
          message: "Title, course ID, and user ID are required",
        },
        400,
      );
    }

    let quizQuestions = questions;
    if (isAiGenerated && contentForAi) {
      try {
        quizQuestions = await generateQuestionsWithAI(contentForAi);
      } catch (aiError) {
        console.error("Error generating questions with AI:", aiError);
        return c.json(
          {
            success: false,
            message: "Failed to generate questions with AI",
          },
          500,
        );
      }
    } else if (
      !questions ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return c.json(
        {
          success: false,
          message: "Questions are required for manual quiz creation",
        },
        400,
      );
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        courseId,
        createdBy: userId,
        status: "ACTIVE",
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

    return c.json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return c.json(
      {
        success: false,
        message: "Failed to create quiz",
      },
      500,
    );
  }
};

export const getQuizzesByCourse = async (c: Context) => {
  try {
    const courseId = c.req.param("courseId");

    if (!courseId) {
      return c.json(
        {
          success: false,
          message: "Course ID is required",
        },
        400,
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, name: true },
    });
    if (!course) {
      return c.json(
        {
          success: false,
          message: "Course not found",
        },
        404,
      );
    }

    try {
      const quizzes = await prisma.quiz.findMany({
        where: { courseId },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          startTime: true,
          endTime: true,
          duration: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { questions: true, studentAttempts: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return c.json({
        success: true,
        data: quizzes,
      });
    } catch (innerError) {
      console.error(
        "Error fetching quizzes with counts, retrying simpler query:",
        innerError,
      );
      const quizzes = await prisma.quiz.findMany({
        where: { courseId },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          startTime: true,
          endTime: true,
          duration: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return c.json({
        success: true,
        data: quizzes.map((q) => ({
          ...q,
          _count: { questions: 0, studentAttempts: 0 },
        })),
        note: "Counts unavailable; returned zeros",
      });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error(
        "Database initialization error while fetching quizzes:",
        error.message,
      );
      return c.json(
        {
          success: false,
          message: "Service unavailable",
        },
        503,
      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(
        "Prisma known request error (quizzes by course):",
        error.code,
        error.meta,
      );
    } else {
      console.error("Error fetching quizzes:", error);
    }
    return c.json(
      {
        success: false,
        message: "Failed to fetch quizzes",
      },
      500,
    );
  }
};

export const getQuizById = async (c: Context) => {
  try {
    const quizId = c.req.param("quizId");
    const userId = c.req.query("userId");

    if (!quizId) {
      return c.json(
        {
          success: false,
          message: "Quiz ID is required",
        },
        400,
      );
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
      return c.json(
        {
          success: false,
          message: "Quiz not found",
        },
        404,
      );
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

    return c.json({
      ...quiz,
      hasAttempted: !!studentAttempt,
      attemptStatus: studentAttempt?.status || null,
    });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch quiz",
      },
      500,
    );
  }
};

export const updateQuiz = async (c: Context) => {
  try {
    const quizId = c.req.param("quizId");
    const {
      title,
      description,
      status,
      startTime,
      endTime,
      duration,
      questions,
    } = await c.req.json();

    if (!quizId) {
      return c.json(
        {
          success: false,
          message: "Quiz ID is required",
        },
        400,
      );
    }

    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!existingQuiz) {
      return c.json(
        {
          success: false,
          message: "Quiz not found",
        },
        404,
      );
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

    return c.json({
      success: true,
      data: updatedQuiz,
    });
  } catch (error) {
    console.error("Error updating quiz:", error);
    return c.json(
      {
        success: false,
        message: "Failed to update quiz",
      },
      500,
    );
  }
};

export const deleteQuiz = async (c: Context) => {
  try {
    const quizId = c.req.param("quizId");

    if (!quizId) {
      return c.json(
        {
          success: false,
          message: "Quiz ID is required",
        },
        400,
      );
    }

    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!existingQuiz) {
      return c.json(
        {
          success: false,
          message: "Quiz not found",
        },
        404,
      );
    }

    await prisma.quiz.delete({
      where: { id: quizId },
    });

    return c.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return c.json(
      {
        success: false,
        message: "Failed to delete quiz",
      },
      500,
    );
  }
};

export const startQuizAttempt = async (c: Context) => {
  try {
    const quizId = c.req.param("quizId");
    const { userId } = await c.req.json();

    if (!quizId || !userId) {
      return c.json(
        {
          success: false,
          message: "Quiz ID and user ID are required",
        },
        400,
      );
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      return c.json(
        {
          success: false,
          message: "Quiz not found",
        },
        404,
      );
    }

    if (quiz.status !== "ACTIVE") {
      return c.json(
        {
          success: false,
          message: "Quiz is not active",
        },
        400,
      );
    }

    const now = new Date();
    if (quiz.startTime && quiz.startTime > now) {
      return c.json(
        {
          success: false,
          message: "Quiz has not started yet",
        },
        400,
      );
    }

    if (quiz.endTime && quiz.endTime < now) {
      return c.json(
        {
          success: false,
          message: "Quiz has ended",
        },
        400,
      );
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
        return c.json(
          {
            success: false,
            message: "You have already completed this quiz",
          },
          400,
        );
      }

      return c.json(existingAttempt);
    }

    const attempt = await prisma.studentQuizAttempt.create({
      data: {
        quizId,
        userId,
        status: "IN_PROGRESS",
      },
    });

    return c.json(attempt);
  } catch (error) {
    console.error("Error starting quiz attempt:", error);
    return c.json(
      {
        success: false,
        message: "Failed to start quiz attempt",
      },
      500,
    );
  }
};

export const submitQuizAnswer = async (c: Context) => {
  try {
    const attemptId = c.req.param("attemptId");
    const { questionId, selectedOption } = await c.req.json();

    if (!attemptId || !questionId || selectedOption === undefined) {
      return c.json(
        {
          success: false,
          message: "Attempt ID, question ID, and selected option are required",
        },
        400,
      );
    }

    const attempt = await prisma.studentQuizAttempt.findFirst({
      where: {
        id: attemptId,
        status: "IN_PROGRESS",
      },
    });

    if (!attempt) {
      return c.json(
        {
          success: false,
          message: "Attempt not found or already completed",
        },
        404,
      );
    }

    const question = await prisma.quizQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return c.json(
        {
          success: false,
          message: "Question not found",
        },
        404,
      );
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

    return c.json({
      success: true,
      message: "Answer submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return c.json(
      {
        success: false,
        message: "Failed to submit answer",
      },
      500,
    );
  }
};

export const completeQuizAttempt = async (c: Context) => {
  try {
    const attemptId = c.req.param("attemptId");

    if (!attemptId) {
      return c.json(
        {
          success: false,
          message: "Attempt ID is required",
        },
        400,
      );
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
      return c.json(
        {
          success: false,
          message: "Attempt not found or already completed",
        },
        404,
      );
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

    return c.json(completedAttempt);
  } catch (error) {
    console.error("Error completing quiz attempt:", error);
    return c.json(
      {
        success: false,
        message: "Failed to complete quiz attempt",
      },
      500,
    );
  }
};

export const getQuizLeaderboard = async (c: Context) => {
  try {
    const quizId = c.req.param("quizId");

    if (!quizId) {
      return c.json(
        {
          success: false,
          message: "Quiz ID is required",
        },
        400,
      );
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { id: true, title: true },
    });

    if (!quiz) {
      return c.json(
        {
          success: false,
          message: "Quiz not found",
        },
        404,
      );
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

    return c.json({
      success: true,
      quiz,
      leaderboard,
    });
  } catch (error) {
    console.error("Error fetching quiz leaderboard:", error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch quiz leaderboard",
      },
      500,
    );
  }
};

export const getStudentQuizAttempts = async (c: Context) => {
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

    return c.json({
      success: true,
      data: attempts,
    });
  } catch (error) {
    console.error("Error fetching student attempts:", error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch student attempts",
      },
      500,
    );
  }
};

export async function generateQuestionsWithAI(content: string) {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_AI_API_KEY is not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
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

export const generateQuestionsApi = async (c: Context) => {
  try {
    const { content } = await c.req.json();

    if (!content) {
      return c.json(
        {
          success: false,
          message: "Content is required for generating questions",
        },
        400,
      );
    }

    const questions = await generateQuestionsWithAI(content);
    return c.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error("Error generating questions with AI:", error);
    return c.json(
      {
        success: false,
        message: "Failed to generate questions with AI",
      },
      500,
    );
  }
};

export const getActiveQuizzesByCourse = async (c: Context) => {
  try {
    const courseId = c.req.query("courseId");
    const userId = c.req.query("userId");

    const filters: any = {
      status: "ACTIVE",
    };

    const timeFilters: any = {};

    timeFilters.OR = [{ startTime: null }, { startTime: { lte: new Date() } }];

    const endTimeFilter = {
      OR: [{ endTime: null }, { endTime: { gte: new Date() } }],
    };

    const finalFilters = {
      ...filters,
      AND: [timeFilters, endTimeFilter],
    };

    if (userId && !courseId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          class: {
            include: {
              courses: {
                select: { id: true },
              },
            },
          },
        },
      });

      if (user?.class?.courses) {
        const courseIds = user.class.courses.map((course) => course.id);
        finalFilters.courseId = { in: courseIds };
        console.log(
          `Filtering quizzes for user ${userId} by courses:`,
          courseIds,
        );
      } else {
        console.log(`User ${userId} has no enrolled courses`);
        return c.json({
          success: true,
          data: [],
        });
      }
    } else if (courseId) {
      finalFilters.courseId = courseId;
    }

    const quizzes = await prisma.quiz.findMany({
      where: finalFilters,
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

    console.log(
      `Found ${quizzes.length} active quizzes:`,
      quizzes.map((q) => ({
        id: q.id,
        title: q.title,
        courseId: q.courseId,
        courseName: q.course.name,
        status: q.status,
      })),
    );

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

      quizzesWithAttempts = quizzesWithAttempts.filter(
        // @ts-ignore - sad
        (quiz) => quiz.attemptStatus !== "COMPLETED",
      );
    }

    return c.json({
      success: true,
      data: quizzesWithAttempts,
    });
  } catch (error) {
    console.error("Error fetching active quizzes:", error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch active quizzes",
      },
      500,
    );
  }
};

export const getAttemptById = async (c: Context) => {
  try {
    const attemptId = c.req.param("attemptId");

    if (!attemptId) {
      return c.json(
        {
          success: false,
          message: "Attempt ID is required",
        },
        400,
      );
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
      return c.json(
        {
          success: false,
          message: "Attempt not found",
        },
        404,
      );
    }

    return c.json(attempt);
  } catch (error) {
    console.error("Error fetching attempt:", error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch attempt",
      },
      500,
    );
  }
};

export const getAttemptAnswers = async (c: Context) => {
  try {
    const attemptId = c.req.param("attemptId");

    if (!attemptId) {
      return c.json(
        {
          success: false,
          message: "Attempt ID is required",
        },
        400,
      );
    }

    const answers = await prisma.studentQuestionAnswer.findMany({
      where: { studentAttemptId: attemptId },
      select: {
        id: true,
        questionId: true,
        selectedOption: true,
      },
    });

    return c.json({
      success: true,
      answers,
    });
  } catch (error) {
    console.error("Error fetching attempt answers:", error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch attempt answers",
      },
      500,
    );
  }
};

export const getAttemptResults = async (c: Context) => {
  try {
    const attemptId = c.req.param("attemptId");

    if (!attemptId) {
      return c.json(
        {
          success: false,
          message: "Attempt ID is required",
        },
        400,
      );
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
      return c.json(
        {
          success: false,
          message: "Attempt not found",
        },
        404,
      );
    }

    if (attempt.status !== "COMPLETED") {
      return c.json(
        {
          success: false,
          message: "This attempt has not been completed yet",
        },
        400,
      );
    }

    return c.json(attempt);
  } catch (error) {
    console.error("Error fetching attempt results:", error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch attempt results",
      },
      500,
    );
  }
};

export const getQuizProgress = async (c: Context) => {
  try {
    const quizId = c.req.param("quizId");

    if (!quizId) {
      return c.json(
        {
          success: false,
          message: "Quiz ID is required",
        },
        400,
      );
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        course: true,
      },
    });

    if (!quiz) {
      return c.json(
        {
          success: false,
          message: "Quiz not found",
        },
        404,
      );
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

    return c.json({
      success: true,
      students: studentProgress,
      progress,
    });
  } catch (error) {
    console.error("Error fetching quiz progress:", error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch quiz progress",
      },
      500,
    );
  }
};
