import prisma from "../config/db.js";
import axios from "axios";

export const generateRoadmap = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title = "Personalized Learning Roadmap" } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const wrongAnswers = await prisma.wrongAnswer.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
    });

    if (wrongAnswers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No wrong answers found to generate a roadmap",
      });
    }

    const quizAttempts = await prisma.studentQuizAttempt.findMany({
      where: { userId },
      include: {
        quiz: {
          include: {
            course: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    const topicFrequency = {};

    wrongAnswers.forEach((answer) => {
      const topic = extractTopicFromQuestion(answer.question);
      if (!topicFrequency[topic]) {
        topicFrequency[topic] = {
          count: 0,
          questions: [],
          courseName: answer.courseName || "General",
          materialName: answer.materialName || "Unknown Material",
        };
      }

      topicFrequency[topic].count += 1;
      topicFrequency[topic].questions.push({
        question: answer.question,
        correctAnswer: answer.correctAnswer,
      });
    });

    const sortedTopics = Object.entries(topicFrequency)
      .sort(
        (a, b) =>
          (b[1] as { count: number }).count - (a[1] as { count: number }).count,
      )
      .map(([topic, data]) => ({
        topic,
        ...(data as { count: number; questions: any[] }),
      }));

    const roadmapData = await generateRoadmapWithGemini(
      sortedTopics,
      user.name,
    );

    const roadmap = await prisma.roadmap.create({
      data: {
        userId,
        title,
        description: roadmapData.description,
        topics: {
          create: roadmapData.topics.map((topic, index) => ({
            title: topic.title,
            description: topic.description,
            targetDate: new Date(topic.targetDate),
            resources: topic.resources,
            priority: topic.priority,
            order: index,
          })),
        },
      },
      include: {
        topics: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Roadmap generated successfully",
      data: roadmap,
    });
  } catch (error) {
    console.error("Error generating roadmap:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate roadmap",
      error: error.message,
    });
  }
};

export const getUserRoadmaps = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const roadmaps = await prisma.roadmap.findMany({
      where: {
        userId,
        isArchived: false,
      },
      include: {
        topics: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: roadmaps,
    });
  } catch (error) {
    console.error("Error getting user roadmaps:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get roadmaps",
      error: error.message,
    });
  }
};

export const getRoadmapById = async (req, res) => {
  try {
    const { id } = req.params;

    const roadmap = await prisma.roadmap.findUnique({
      where: { id },
      include: {
        topics: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    console.error("Error getting roadmap:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get roadmap",
      error: error.message,
    });
  }
};

export const updateTopicStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (
      !status ||
      !["NOT_STARTED", "IN_PROGRESS", "COMPLETED"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required",
      });
    }

    const updatedTopic = await prisma.roadmapTopic.update({
      where: { id },
      data: { status },
    });

    return res.status(200).json({
      success: true,
      message: "Topic status updated successfully",
      data: updatedTopic,
    });
  } catch (error) {
    console.error("Error updating topic status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update topic status",
      error: error.message,
    });
  }
};

export const archiveRoadmap = async (req, res) => {
  try {
    const { id } = req.params;

    const roadmap = await prisma.roadmap.findUnique({
      where: { id },
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    const updatedRoadmap = await prisma.roadmap.update({
      where: { id },
      data: { isArchived: true },
    });

    return res.status(200).json({
      success: true,
      message: "Roadmap archived successfully",
      data: updatedRoadmap,
    });
  } catch (error) {
    console.error("Error archiving roadmap:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to archive roadmap",
      error: error.message,
    });
  }
};

export const regenerateRoadmap = async (req, res) => {
  try {
    const { id } = req.params;

    const existingRoadmap = await prisma.roadmap.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingRoadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    const wrongAnswers = await prisma.wrongAnswer.findMany({
      where: { userId: existingRoadmap.userId },
      orderBy: { timestamp: "desc" },
    });

    const topicFrequency = {};

    wrongAnswers.forEach((answer) => {
      const topic = extractTopicFromQuestion(answer.question);
      if (!topicFrequency[topic]) {
        topicFrequency[topic] = {
          count: 0,
          questions: [],
          courseName: answer.courseName || "General",
          materialName: answer.materialName || "Unknown Material",
        };
      }

      topicFrequency[topic].count += 1;
      topicFrequency[topic].questions.push({
        question: answer.question,
        correctAnswer: answer.correctAnswer,
      });
    });

    const sortedTopics = Object.entries(topicFrequency)
      .sort(
        (a, b) =>
          (b[1] as { count: number }).count - (a[1] as { count: number }).count,
      )
      .map(([topic, data]) => ({
        topic,
        ...(data as { count: number; questions: any[] }),
      }));

    const roadmapData = await generateRoadmapWithGemini(
      sortedTopics,
      existingRoadmap.user.name,
    );

    await prisma.roadmap.update({
      where: { id },
      data: { isArchived: true },
    });

    const newRoadmap = await prisma.roadmap.create({
      data: {
        userId: existingRoadmap.userId,
        title: `${existingRoadmap.title} (Updated)`,
        description: roadmapData.description,
        topics: {
          create: roadmapData.topics.map((topic, index) => ({
            title: topic.title,
            description: topic.description,
            targetDate: new Date(topic.targetDate),
            resources: topic.resources,
            priority: topic.priority,
            order: index,
          })),
        },
      },
      include: {
        topics: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Roadmap regenerated successfully",
      data: newRoadmap,
    });
  } catch (error) {
    console.error("Error regenerating roadmap:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to regenerate roadmap",
      error: error.message,
    });
  }
};

function extractTopicFromQuestion(question) {
  const dataStructuresKeywords = [
    "tree",
    "graph",
    "array",
    "linked list",
    "stack",
    "queue",
    "hash",
  ];
  const algorithmKeywords = [
    "sort",
    "search",
    "algorithm",
    "complexity",
    "recursive",
    "iteration",
  ];
  const machineLearningKeywords = [
    "cluster",
    "classification",
    "regression",
    "neural",
    "supervised",
    "unsupervised",
    "distance matrix",
    "agglomerative",
  ];

  const questionLower = question.toLowerCase();

  if (machineLearningKeywords.some((kw) => questionLower.includes(kw))) {
    return "Machine Learning";
  } else if (algorithmKeywords.some((kw) => questionLower.includes(kw))) {
    return "Algorithms";
  } else if (dataStructuresKeywords.some((kw) => questionLower.includes(kw))) {
    return "Data Structures";
  }

  return "Computer Science";
}

async function generateRoadmapWithGemini(weakTopics, userName) {
  try {
    const GEMINI_API_ENDPOINT = process.env.GEMINI_API_ENDPOINT;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_ENDPOINT || !GEMINI_API_KEY) {
      throw new Error("Gemini API credentials not configured");
    }

    const prompt = `
    Create a personalized learning roadmap for ${userName} based on their identified weak topics:
    ${JSON.stringify(weakTopics)}
    
    Generate a structured learning plan with:
    1. A brief description of the overall roadmap
    2. 5-7 specific topics to study
    3. For each topic, include:
       - Title
       - Description
       - Realistic target date to complete (within next 30 days)
       - Priority level (1-3, 1 being highest)
       - Learning resources including:
          * Video tutorials (with actual YouTube links)
          * Articles and documentation (with actual URLs)
          * Practice exercises (with actual URLs)
          * Books or courses
    
    Return the response in the following JSON format:
    {
      "description": "Overall roadmap description",
      "topics": [
        {
          "title": "Topic title",
          "description": "Detailed description",
          "targetDate": "YYYY-MM-DD",
          "priority": 1,
          "resources": {
            "videos": [{"title": "Video title", "url": "URL", "duration": "duration"}],
            "articles": [{"title": "Article title", "url": "URL"}],
            "exercises": [{"title": "Exercise title", "url": "URL"}],
            "books": [{"title": "Book title", "author": "Author name", "link": "URL"}]
          }
        }
      ]
    }`;

    const response = await axios({
      method: "post",
      url: GEMINI_API_ENDPOINT,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      data: {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      },
    });

    const generatedText = response.data.candidates[0].content.parts[0].text;

    let jsonContent = generatedText;
    const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    const roadmapData = JSON.parse(jsonContent);

    return roadmapData;
  } catch (error) {
    console.error("Error generating roadmap with Gemini:", error);

    return {
      description:
        "Personalized learning roadmap focusing on your identified weak areas.",
      topics: [
        {
          title: "Understanding Clustering Algorithms",
          description:
            "Learn the fundamentals of clustering algorithms with a focus on agglomerative clustering.",
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0], // 7 days from now
          priority: 1,
          resources: {
            videos: [
              {
                title: "Hierarchical Clustering Explained",
                url: "https://www.youtube.com/watch?v=7xHsRkOdVwo",
                duration: "12:45",
              },
            ],
            articles: [
              {
                title: "Understanding Agglomerative Clustering",
                url: "https://scikit-learn.org/stable/modules/clustering.html#hierarchical-clustering",
              },
            ],
            exercises: [
              {
                title: "Clustering Practice Problems",
                url: "https://www.kaggle.com/learn/clustering",
              },
            ],
            books: [
              {
                title: "Introduction to Data Mining",
                author: "Pang-Ning Tan",
                link: "https://www-users.cs.umn.edu/~kumar001/dmbook/index.php",
              },
            ],
          },
        },
      ],
    };
  }
}
