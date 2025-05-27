"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getRoadmapById,
  updateTopicStatus,
  regenerateRoadmap,
} from "~/lib/api";
import { ny } from "~/lib/utils";
import { format, isPast, formatDistance } from "date-fns";
import Link from "next/link";

// UI Components
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Separator } from "~/components/ui/separator";

type Resource = {
  title: string;
  url: string;
  duration?: string;
  author?: string;
  link?: string;
};

type ResourceCollection = {
  videos: Resource[];
  articles: Resource[];
  exercises: Resource[];
  books: Resource[];
};

type RoadmapTopic = {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  priority: number;
  order: number;
  resources: ResourceCollection;
};

type Roadmap = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  topics: RoadmapTopic[];
};

export default function RoadmapDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        const response = await getRoadmapById(params.id);

        if (response.success) {
          setRoadmap(response.data);
        } else {
          setError(response.message || "Failed to load roadmap");
        }
      } catch (error) {
        console.error("Error fetching roadmap:", error);
        setError("Failed to load roadmap. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [params.id]);

  const handleUpdateStatus = async (
    topicId: string,
    newStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED",
  ) => {
    if (!roadmap) return;

    try {
      setUpdatingStatus(topicId);
      const response = await updateTopicStatus(topicId, newStatus);

      if (response.success) {
        // Update local state
        const updatedTopics = roadmap.topics.map((topic) =>
          topic.id === topicId ? { ...topic, status: newStatus } : topic,
        );

        setRoadmap({
          ...roadmap,
          topics: updatedTopics,
        });
      } else {
        setError("Failed to update topic status: " + response.message);
      }
    } catch (error) {
      console.error("Error updating topic status:", error);
      setError("Failed to update topic status. Please try again.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleRegenerateRoadmap = async () => {
    if (!roadmap) return;

    try {
      setRegenerating(true);
      const response = await regenerateRoadmap(roadmap.id);

      if (response.success) {
        // Navigate to the new roadmap
        router.push(`/roadmap/${response.data.id}`);
      } else {
        setError("Failed to regenerate roadmap: " + response.message);
      }
    } catch (error) {
      console.error("Error regenerating roadmap:", error);
      setError("Failed to regenerate roadmap. Please try again.");
    } finally {
      setRegenerating(false);
    }
  };

  const calculateProgress = (topics: RoadmapTopic[]) => {
    if (topics.length === 0) return 0;
    const completed = topics.filter(
      (topic) => topic.status === "COMPLETED",
    ).length;
    return Math.round((completed / topics.length) * 100);
  };

  const sortedTopics =
    roadmap?.topics.sort((a, b) => {
      // First by priority (1 is highest)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // Then by order
      return a.order - b.order;
    }) || [];

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-3/4 rounded bg-gray-200"></div>
          <div className="h-6 w-1/2 rounded bg-gray-200"></div>
          <div className="h-64 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="container mx-auto max-w-6xl py-6">
        <Alert className="border-red-400 bg-red-50 mb-6">
          <AlertDescription className="text-red-700">
            {error ||
              "Roadmap not found. Please try again or go back to roadmaps."}
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline">
          <Link href="/roadmap">Back to Roadmaps</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-6">
      <div className="mb-8">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Button asChild variant="ghost" size="sm" className="mb-2">
              <Link href="/roadmap" className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Roadmaps
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">{roadmap.title}</h1>
            <p className="mt-1 text-gray-600">
              Created {format(new Date(roadmap.createdAt), "MMMM d, yyyy")}
            </p>
          </div>
          <Button
            onClick={handleRegenerateRoadmap}
            disabled={regenerating}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {regenerating ? "Regenerating..." : "Regenerate Roadmap"}
          </Button>
        </div>

        <div className="mb-8 rounded-lg border bg-bground2 p-6">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <h2 className="mb-2 text-xl font-semibold">Overall Progress</h2>
              <div className="flex items-center gap-3">
                <Progress
                  value={calculateProgress(roadmap.topics)}
                  className="h-3 flex-1"
                />
                <span className="font-medium">
                  {calculateProgress(roadmap.topics)}%
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-xl font-bold">{roadmap.topics.length}</div>
                <div className="text-sm text-gray-600">Topics</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">
                  {
                    roadmap.topics.filter((t) => t.status === "COMPLETED")
                      .length
                  }
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">
                  {
                    roadmap.topics.filter((t) => t.status === "IN_PROGRESS")
                      .length
                  }
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
            </div>
          </div>

          <p className="text-gray-700">{roadmap.description}</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="mb-4 text-2xl font-bold">Your Learning Path</h2>

        {sortedTopics.map((topic, index) => (
          <Card
            key={topic.id}
            className="overflow-hidden border-border bg-bground2"
          >
            <CardHeader
              className={ny(
                "border-b",
                topic.priority === 1
                  ? "from-red-50 bg-gradient-to-r to-pink-50"
                  : topic.priority === 2
                    ? "bg-gradient-to-r from-emerald-50 to-amber-50"
                    : "bg-gradient-to-r from-sky-50 to-indigo-50",
              )}
            >
              <div className="flex items-center justify-between">
                <Badge
                  className={ny(
                    topic.priority === 1
                      ? "bg-red hover:bg-red"
                      : topic.priority === 2
                        ? "hover:pri bg-pri"
                        : "bg-sky-500 hover:bg-sky-500",
                  )}
                >
                  Priority {topic.priority}
                </Badge>
                <Badge
                  className={ny(
                    topic.status === "COMPLETED"
                      ? "bg-green"
                      : topic.status === "IN_PROGRESS"
                        ? "bg-yellow-500"
                        : "bg-gray-500",
                  )}
                >
                  {topic.status.replace("_", " ")}
                </Badge>
              </div>
              <CardTitle className="mt-2 text-xl">
                {index + 1}. {topic.title}
              </CardTitle>
              <CardDescription>
                Target date:{" "}
                {format(new Date(topic.targetDate), "MMMM d, yyyy")}
                {isPast(new Date(topic.targetDate)) &&
                  topic.status !== "COMPLETED" && (
                    <span className="text-red-600 ml-2 font-medium">
                      (Overdue by{" "}
                      {formatDistance(new Date(topic.targetDate), new Date())})
                    </span>
                  )}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <p className="mb-6 text-gray-400">{topic.description}</p>

              <Tabs defaultValue="videos">
                <TabsList className="mb-2">
                  <TabsTrigger value="videos">Videos</TabsTrigger>
                  <TabsTrigger value="articles">Articles</TabsTrigger>
                  <TabsTrigger value="exercises">Exercises</TabsTrigger>
                  <TabsTrigger value="books">Books</TabsTrigger>
                </TabsList>

                <TabsContent value="videos" className="space-y-3">
                  {topic.resources?.videos?.length > 0 ? (
                    topic.resources.videos.map((video, idx) => (
                      <div key={idx} className="flex flex-col">
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {video.title}
                        </a>
                        {video.duration && (
                          <span className="text-sm text-gray-500">
                            Duration: {video.duration}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="italic text-gray-500">
                      No video resources available
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="articles" className="space-y-3">
                  {topic.resources?.articles?.length > 0 ? (
                    topic.resources.articles.map((article, idx) => (
                      <div key={idx}>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {article.title}
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="italic text-gray-500">
                      No article resources available
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="exercises" className="space-y-3">
                  {topic.resources?.exercises?.length > 0 ? (
                    topic.resources.exercises.map((exercise, idx) => (
                      <div key={idx}>
                        <a
                          href={exercise.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {exercise.title}
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="italic text-gray-500">
                      No exercise resources available
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="books" className="space-y-3">
                  {topic.resources?.books?.length > 0 ? (
                    topic.resources.books.map((book, idx) => (
                      <div key={idx} className="flex flex-col">
                        <a
                          href={book.link || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {book.title}
                        </a>
                        {book.author && (
                          <span className="text-sm text-gray-500">
                            by {book.author}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="italic text-gray-500">
                      No book resources available
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter className="flex justify-between border-t bg-bground2 pt-2">
              <Button
                variant="outline"
                className={ny(
                  "border-blue-300",
                  topic.status === "NOT_STARTED" && "bg-blue-50 text-blue-700",
                )}
                disabled={
                  topic.status === "NOT_STARTED" || updatingStatus === topic.id
                }
                onClick={() => handleUpdateStatus(topic.id, "NOT_STARTED")}
              >
                Not Started
              </Button>

              <Button
                variant="outline"
                className={ny(
                  "border-yellow-300",
                  topic.status === "IN_PROGRESS" &&
                    "bg-yellow-50 text-yellow-700",
                )}
                disabled={
                  topic.status === "IN_PROGRESS" || updatingStatus === topic.id
                }
                onClick={() => handleUpdateStatus(topic.id, "IN_PROGRESS")}
              >
                In Progress
              </Button>

              <Button
                variant="outline"
                className={ny(
                  "border-green-300",
                  topic.status === "COMPLETED" && "bg-green-50 text-green-700",
                )}
                disabled={
                  topic.status === "COMPLETED" || updatingStatus === topic.id
                }
                onClick={() => handleUpdateStatus(topic.id, "COMPLETED")}
              >
                Completed
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
