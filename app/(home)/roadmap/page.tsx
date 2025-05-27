"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserRoadmaps, generateRoadmap } from "~/lib/api";
import { ny } from "~/lib/utils";
import Link from "next/link";
import { format } from "date-fns";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Progress } from "~/components/ui/progress";
import { Alert, AlertDescription } from "~/components/ui/alert";

type RoadmapTopic = {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  priority: number;
  order: number;
  resources: any;
};

type Roadmap = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  topics: RoadmapTopic[];
  isArchived: boolean;
};

export default function RoadmapPage() {
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock user ID - in a real app, get this from auth context
  const userId = "clzi4le5q000j11p6q2lxsk71";

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        setLoading(true);
        const response = await getUserRoadmaps(userId);
        if (response.success) {
          setRoadmaps(response.data);
        } else {
          setError(response.message || "Failed to load roadmaps");
        }
      } catch (error) {
        console.error("Error fetching roadmaps:", error);
        setError("Failed to load roadmaps. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, [userId]);

  const handleGenerateRoadmap = async () => {
    try {
      setGenerating(true);
      setError(null);

      const response = await generateRoadmap(userId);

      if (response.success) {
        // Add the new roadmap to the list and navigate to it
        setRoadmaps([response.data, ...roadmaps]);
        router.push(`/roadmap/${response.data.id}`);
      } else {
        setError(response.message || "Failed to generate roadmap");
      }
    } catch (error) {
      console.error("Error generating roadmap:", error);
      setError("Failed to generate roadmap. Please try again later.");
    } finally {
      setGenerating(false);
    }
  };

  const calculateProgress = (topics: RoadmapTopic[]) => {
    if (topics.length === 0) return 0;

    const completed = topics.filter(
      (topic) => topic.status === "COMPLETED",
    ).length;
    return Math.round((completed / topics.length) * 100);
  };

  return (
    <div className="container mx-auto max-w-6xl py-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Learning Roadmaps</h1>
        <Button
          onClick={handleGenerateRoadmap}
          disabled={generating}
          className="from-blue-600 hover:from-blue-700 bg-gradient-to-r to-indigo-600 hover:to-indigo-700"
        >
          {generating ? "Generating..." : "Generate New Roadmap"}
        </Button>
      </div>

      {error && (
        <Alert className="border-red-400 bg-red-50 mb-6">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex animate-pulse flex-col items-center"></div>
        </div>
      ) : roadmaps.length === 0 ? (
        <div className="rounded-lg border py-12 text-center">
          <h3 className="mb-2 text-xl font-medium">No roadmaps found</h3>
          <p className="mb-6 text-gray-600">
            Generate a personalized learning roadmap based on your quiz
            performance
          </p>
          <Button
            onClick={handleGenerateRoadmap}
            disabled={generating}
            variant="outline"
          >
            {generating ? "Generating..." : "Create Your First Roadmap"}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {roadmaps.map((roadmap) => (
            <Card
              key={roadmap.id}
              className="overflow-hidden border-border transition-all duration-200 hover:shadow-md"
            >
              <CardHeader className="border-b bg-gradient-to-r from-blue to-indigo-500">
                <CardTitle className="flex items-center justify-between">
                  <span className="mr-2 truncate">{roadmap.title}</span>
                  <Badge className="bg-gray-100">
                    {roadmap.topics.length} topics
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-2s00">
                  Created {format(new Date(roadmap.createdAt), "MMMM d, yyyy")}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="mb-4">
                  <p className="mb-2 text-sm text-gray-500">Progress</p>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={calculateProgress(roadmap.topics)}
                      className="h-2"
                    />
                    <span className="text-sm font-medium">
                      {calculateProgress(roadmap.topics)}%
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="mb-2 font-medium">Top priority topics:</h4>
                  <ul className="space-y-1">
                    {roadmap.topics
                      .filter((topic) => topic.priority === 1)
                      .slice(0, 2)
                      .map((topic) => (
                        <li key={topic.id} className="flex items-center gap-2">
                          <div
                            className={ny(
                              "h-2 w-2 rounded-full",
                              topic.status === "COMPLETED"
                                ? "bg-green-500"
                                : topic.status === "IN_PROGRESS"
                                  ? "bg-yellow-500"
                                  : "bg-gray-400",
                            )}
                          />
                          <span className="truncate">{topic.title}</span>
                        </li>
                      ))}
                  </ul>
                </div>

                <p className="line-clamp-2 text-sm text-gray-600">
                  {roadmap.description ||
                    "A personalized learning roadmap based on your performance."}
                </p>
              </CardContent>

              <CardFooter className="flex items-center justify-center border-t bg-bground2 pt-2">
                <Button
                  asChild
                  className="w-full justify-center bg-bground2 text-lg text-gray-300 hover:bg-bground2"
                >
                  <Link href={`/roadmap/${roadmap.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
