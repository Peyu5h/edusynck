"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "~/components/ui/button";
import {
  PlusIcon,
  Search,
  Timer,
  FileCheck,
  Calendar,
  Settings,
  Loader2,
} from "lucide-react";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import axios from "axios";
import { toast } from "~/components/ui/use-toast";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  startTime: string | null;
  endTime: string | null;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
  isAiGenerated: boolean;
  _count: {
    questions: number;
    studentAttempts: number;
  };
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const user = useSelector((state: any) => state.user.user);
  const courses = user?.taughtClasses
    ? user.taughtClasses.flatMap((cls: any) => cls.courses || [])
    : [];

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses]);

  useEffect(() => {
    if (selectedCourseId) {
      fetchQuizzes(selectedCourseId);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredQuizzes(quizzes);
    } else {
      const filtered = quizzes.filter((quiz) =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredQuizzes(filtered);
    }
  }, [searchQuery, quizzes]);

  const fetchQuizzes = async (courseId: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/course/${courseId}`,
      );
      if (response.data.success) {
        setQuizzes(response.data.data);
        setFilteredQuizzes(response.data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch quizzes",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch quizzes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Draft
          </Badge>
        );
      case "ACTIVE":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Active
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Completed
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quizzes</h1>
        <Link href="/teacher/quizzes/create">
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Create Quiz
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search quizzes..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {courses.length > 0 && (
            <select
              className="rounded-md border p-2"
              value={selectedCourseId || ""}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              {courses.map((course: any) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {renderQuizzes(filteredQuizzes)}
          </TabsContent>

          <TabsContent value="draft" className="space-y-4">
            {renderQuizzes(
              filteredQuizzes.filter((quiz) => quiz.status === "DRAFT"),
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {renderQuizzes(
              filteredQuizzes.filter((quiz) => quiz.status === "ACTIVE"),
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {renderQuizzes(
              filteredQuizzes.filter((quiz) => quiz.status === "COMPLETED"),
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );

  function renderQuizzes(quizzes: Quiz[]) {
    if (quizzes.length === 0) {
      return (
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div>
            <p className="text-lg font-medium">No quizzes found</p>
            <p className="text-sm text-muted-foreground">
              Create a new quiz to get started
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => (
          <Link key={quiz.id} href={`/teacher/quizzes/${quiz.id}/leaderboard`}>
            <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="line-clamp-1">{quiz.title}</CardTitle>
                  {getStatusBadge(quiz.status)}
                </div>
                <CardDescription className="line-clamp-2">
                  {quiz.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {quiz._count.questions} questions
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {quiz.duration
                        ? `${quiz.duration} minutes`
                        : "No time limit"}
                    </span>
                  </div>
                  {quiz.startTime && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(quiz.startTime), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {quiz._count.studentAttempts} attempts
                  </span>
                </div>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    );
  }
}
