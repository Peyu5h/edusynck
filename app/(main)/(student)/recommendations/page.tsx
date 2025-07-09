"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Loader2 } from "lucide-react";
import YouTubeVideos from "~/components/YouTubeVideos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface WrongAnswer {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  materialName: string;
  courseName: string;
  timestamp: string;
}

interface SearchTopic {
  title: string;
  keywords: string[];
}

export default function RecommendationsPage() {
  const user = useSelector((state: any) => state.user.user);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [searchTopics, setSearchTopics] = useState<SearchTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState(
    "Loading your recommendations...",
  );

  const genAI = new GoogleGenerativeAI(
    process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY as string,
  );

  useEffect(() => {
    const fetchWrongAnswers = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const analyticsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analytics/wrong-answers/${user.id}`,
        );

        if (analyticsResponse.data.success) {
          setWrongAnswers(analyticsResponse.data.data);
          processWrongAnswers(analyticsResponse.data.data);
        } else {
          setError("Failed to fetch your learning data");
        }
      } catch (analyticsError) {
        console.error("Error fetching analytics data:", analyticsError);
        setError(
          "An error occurred while retrieving your personalized recommendations",
        );
      }
    };

    fetchWrongAnswers();
  }, [user?.id]);

  const processWrongAnswers = async (wrongAnswers: WrongAnswer[]) => {
    if (!wrongAnswers.length) {
      setIsLoading(false);
      return;
    }

    setProcessingStatus("Analyzing your learning patterns...");
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-latest",
      });

      const wrongAnswersText = wrongAnswers
        .map(
          (answer) => `
Question: ${answer.question}
Your Answer: ${answer.userAnswer}
Correct Answer: ${answer.correctAnswer}
Subject: ${answer.courseName} - ${answer.materialName}
`,
        )
        .join("\n");

      const prompt = `
Based on the following list of wrong answers from a student's quizzes, identify 3 key topics the student needs to focus on.

For each topic:
1. Create a clear, descriptive title
2. Generate 3-5 specific search keywords that would help find educational videos on this topic

Format your output as a valid JSON array of objects like this:
[
  {
    "title": "Topic Title",
    "keywords": ["keyword1", "keyword2", "keyword3"]
  }
]

Here are the wrong answers:
${wrongAnswersText}
`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Extract JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsedTopics = JSON.parse(jsonMatch[0]);
        setSearchTopics(parsedTopics);
      } else {
        throw new Error(
          "Unable to extract valid search topics from the AI response",
        );
      }
    } catch (err) {
      console.error("Error processing wrong answers:", err);
      setError("Failed to process your learning data for recommendations");

      // Fallback topics if AI processing fails
      setSearchTopics([
        {
          title: "General Study Resources",
          keywords: ["educational tutorial", "learning concept basics"],
        },
        {
          title: "Practice Exercises",
          keywords: ["practice problems", "tutorial exercises"],
        },
        {
          title: "Study Tips",
          keywords: ["effective study techniques", "memory improvement"],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-xl font-medium">{processingStatus}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 rounded-lg p-6">
        <h2 className="mb-4 text-2xl font-bold">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!wrongAnswers.length) {
    return (
      <div className="rounded-lg bg-bground3 p-6 text-center">
        <h2 className="mb-4 text-2xl font-bold">No Learning Data Yet</h2>
        <p className="mb-6 text-lg">
          Complete some quizzes to get personalized video recommendations based
          on your learning needs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold">
          Personalized Recommendations
        </h1>
        <p className="text-lg text-muted-foreground">
          Based on your quiz answers, here are some resources that might help
          you improve.
        </p>
      </div>

      <Tabs defaultValue="topic0" className="w-full">
        <TabsList className="mb-4">
          {searchTopics.map((topic, index) => (
            <TabsTrigger key={index} value={`topic${index}`}>
              {topic.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {searchTopics.map((topic, index) => (
          <TabsContent key={index} value={`topic${index}`} className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>{topic.title}</CardTitle>
                <CardDescription>
                  Search keywords: {topic.keywords.join(", ")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <YouTubeVideos keywords={topic.keywords} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
