"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Loader2, Play, RefreshCw, TrendingUp, Clock } from "lucide-react";
import { Button } from "~/components/ui/button";
import { RecommendationsLoader } from "~/components/Loaders";

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

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle?: string;
  publishedAt?: string;
  viewCount?: string;
  duration?: string;
}

export default function RecommendationsPage() {
  const user = useSelector((state: any) => state.user.user);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [searchTopics, setSearchTopics] = useState<SearchTopic[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeCategory, setActiveCategory] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const genAI = new GoogleGenerativeAI(
    process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY as string,
  );

  // Helper function to format YouTube duration
  const formatDuration = (duration: string): string => {
    if (!duration) return "";

    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "";

    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
  };

  // Helper function to format view count
  const formatViewCount = (viewCount: string): string => {
    if (!viewCount) return "";

    const count = parseInt(viewCount);
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    } else {
      return `${count} views`;
    }
  };

  const fetchVideosForTopic = async (topic: SearchTopic) => {
    setIsLoadingVideos(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/youtube`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            keywords: topic.keywords.join(" "),
            excludeTerms: "shorts",
            relevanceLanguage: "en",
            type: "video",
            maxResults: 6, // Fetch 6 videos instead of default
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch videos: ${response.status}`);
      }

      const data = await response.json();
      const fetchedVideos = data.items
        .filter(
          (item: any) => !item.snippet.title.toLowerCase().includes("#short"),
        )
        .map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail:
            item.snippet.thumbnails.high?.url ||
            item.snippet.thumbnails.medium?.url,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          duration: item.contentDetails?.duration,
          viewCount: item.statistics?.viewCount,
        }));

      setVideos(fetchedVideos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      setVideos([]);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const fetchMoreVideos = async () => {
    if (searchTopics[activeCategory]) {
      await fetchVideosForTopic(searchTopics[activeCategory]);
    }
  };

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

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
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
Based on the following list of wrong answers from a student's quizzes, identify 5 key topics the student needs to focus on.

For each topic:
1. Create a clear, descriptive title (keep it concise, max 3-4 words)
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

      // extract JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsedTopics = JSON.parse(jsonMatch[0]);
        setSearchTopics(parsedTopics);

        // Fetch videos for the first topic
        if (parsedTopics.length > 0) {
          await fetchVideosForTopic(parsedTopics[0]);
        }
      } else {
        throw new Error(
          "Unable to extract valid search topics from the AI response",
        );
      }
    } catch (err) {
      console.error("Error processing wrong answers:", err);
      setError("Failed to process your learning data for recommendations");

      const fallbackTopics = [
        {
          title: "Study Techniques",
          keywords: ["effective study methods", "learning strategies"],
        },
        {
          title: "Memory Improvement",
          keywords: ["memory techniques", "retention methods"],
        },
        {
          title: "Problem Solving",
          keywords: ["problem solving skills", "analytical thinking"],
        },
        {
          title: "Time Management",
          keywords: ["time management", "study planning"],
        },
        {
          title: "Test Preparation",
          keywords: ["exam preparation", "test taking strategies"],
        },
      ];

      setSearchTopics(fallbackTopics);
      if (fallbackTopics.length > 0) {
        await fetchVideosForTopic(fallbackTopics[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <RecommendationsLoader />
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

  const handleCategoryChange = async (index: number) => {
    setActiveCategory(index);
    if (searchTopics[index]) {
      await fetchVideosForTopic(searchTopics[index]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-light text-text">Recommended for You</h1>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {searchTopics.map((topic, index) => (
          <Button
            key={index}
            variant={activeCategory === index ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange(index)}
            className={`rounded-md transition-all ${
              activeCategory === index
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            {topic.title}
          </Button>
        ))}
      </div>

      {/* Videos Grid */}
      {isLoadingVideos ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border bg-card shadow-sm"
            >
              <div className="aspect-video animate-pulse bg-muted"></div>
              <div className="space-y-3 p-4">
                <div className="h-5 w-full animate-pulse rounded bg-muted"></div>
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
                <div className="flex items-center justify-between">
                  <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
                  <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="group cursor-pointer overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-lg"
              onClick={() =>
                window.open(
                  `https://www.youtube.com/watch?v=${video.id}`,
                  "_blank",
                )
              }
            >
              {/* Video Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                  <Play className="h-12 w-12 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                {/* Duration Overlay */}
                {video.duration && (
                  <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
                    {formatDuration(video.duration)}
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="space-y-2 p-4">
                <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight">
                  {video.title}
                </h3>

                <div className="space-y-1">
                  <p className="truncate text-xs text-muted-foreground">
                    {video.channelTitle}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {video.viewCount && (
                      <span>{formatViewCount(video.viewCount)}</span>
                    )}
                    {video.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(video.publishedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {videos.length > 0 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={fetchMoreVideos}
            disabled={isLoadingVideos}
            className="px-8"
          >
            {isLoadingVideos ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refetch Videos
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
