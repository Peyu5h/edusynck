"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  ArrowLeft,
  Award,
  Clock,
  Trophy,
  User,
  Users,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface LeaderboardEntry {
  id: string;
  score: number;
  completedAt: string;
  startedAt: string;
  completionTime?: string;
  completionTimeMs?: number;
  formattedTime?: string;
  name?: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
  };
  _count?: {
    answers: number;
  };
}

interface Quiz {
  id: string;
  title: string;
  status: string;
  course: {
    name: string;
  };
  _count: {
    questions: number;
  };
}

export default function QuizLeaderboardPage() {
  const { quizId } = useParams();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user from your global state
        // This example assumes you have a Redux store or context with user data
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          setCurrentUserId(user.id);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
    fetchQuizData();
    fetchLeaderboard();
  }, [quizId]);

  const fetchQuizData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/${quizId}`,
      );
      setQuiz(response.data);
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      toast.error("Failed to load quiz information");
    }
  };

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/${quizId}/leaderboard`,
      );

      // Check the response structure and extract the leaderboard array
      if (response.data && response.data.leaderboard) {
        setLeaderboard(response.data.leaderboard);
      } else if (Array.isArray(response.data)) {
        // Handle case where the API returns the array directly
        setLeaderboard(response.data);
      } else {
        console.error("Unexpected leaderboard data format:", response.data);
        setLeaderboard([]);
        toast.error("Leaderboard data format error");
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast.error("Failed to load leaderboard");
      setLeaderboard([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserRank = (userId: string): number => {
    if (!Array.isArray(leaderboard)) {
      console.error("Leaderboard is not an array:", leaderboard);
      return 0;
    }

    const index = leaderboard.findIndex(
      (entry) =>
        (entry.user && entry.user.id === userId) || entry.userId === userId,
    );
    return index !== -1 ? index + 1 : 0;
  };

  const getAwardIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Trophy className="h-5 w-5 text-amber-700" />;
      default:
        return null;
    }
  };

  const isCurrentUser = (userId: string | undefined): boolean => {
    if (!userId || !currentUserId) return false;
    return userId === currentUserId;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href={`/quizzes`} passHref>
          <Button variant="ghost" className="mb-4 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Quizzes
          </Button>
        </Link>

        <h1 className="text-3xl font-bold">{quiz?.title} - Leaderboard</h1>
        {quiz && (
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <Badge className="text-sm">{quiz.course.name}</Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {Array.isArray(leaderboard) ? leaderboard.length : 0}{" "}
                participants
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4" />
              <span>
                Top score:{" "}
                {Array.isArray(leaderboard) && leaderboard.length > 0
                  ? leaderboard[0].score
                  : "N/A"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* User's rank */}
      {currentUserId && getUserRank(currentUserId) > 0 && (
        <div className="mb-6 rounded-lg border bg-muted p-4">
          <div className="text-lg font-medium">Your Position</div>
          <div className="mt-2 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Badge className="mx-auto flex h-8 w-8 items-center justify-center rounded-full p-2 text-center">
                {getUserRank(currentUserId)}
              </Badge>
              <span className="text-xl font-bold">
                {leaderboard.find(
                  (entry) =>
                    entry.user?.id === currentUserId ||
                    entry.userId === currentUserId,
                )?.score || 0}{" "}
                points
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {leaderboard.find(
                  (entry) =>
                    entry.user?.id === currentUserId ||
                    entry.userId === currentUserId,
                )?.completionTime || "N/A"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard table */}
      <div className="rounded-lg border">
        <Table>
          <TableCaption>Leaderboard rankings for this quiz</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Rank</TableHead>
              <TableHead>Student</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-right">Completion Time</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(leaderboard) && leaderboard.length > 0 ? (
              leaderboard.map((entry, index) => (
                <TableRow
                  key={entry.id || index}
                  className={isCurrentUser(entry.user?.id) ? "bg-muted/50" : ""}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getAwardIcon(index + 1)}
                      {index + 1}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {entry.user ? entry.user.name : entry.name || "Unknown"}
                      </span>
                      {(entry.user && isCurrentUser(entry.user.id)) ||
                      (entry.userId && isCurrentUser(entry.userId)) ? (
                        <Badge variant="outline" className="ml-2">
                          You
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {entry.score} / {quiz?._count?.questions || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.completionTime || entry.formattedTime || "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.completedAt &&
                      format(new Date(entry.completedAt), "MMM d, h:mm a")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No participants yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
