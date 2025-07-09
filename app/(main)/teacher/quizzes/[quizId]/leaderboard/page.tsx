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
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { ny } from "~/lib/utils";

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

export default function TeacherQuizLeaderboardPage() {
  const { quizId } = useParams();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<{
    averageScore: number;
    totalParticipants: number;
    averageCompletionTime: string;
  }>({
    averageScore: 0,
    totalParticipants: 0,
    averageCompletionTime: "N/A",
  });

  useEffect(() => {
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

      let leaderboardData: LeaderboardEntry[] = [];
      if (response.data && response.data.leaderboard) {
        leaderboardData = response.data.leaderboard;
      } else if (Array.isArray(response.data)) {
        leaderboardData = response.data;
      } else {
        console.error("Unexpected leaderboard data format:", response.data);
        toast.error("Leaderboard data format error");
      }

      setLeaderboard(leaderboardData);

      if (leaderboardData.length > 0) {
        const totalScore = leaderboardData.reduce(
          (sum, entry) => sum + entry.score,
          0,
        );
        const avgScore = totalScore / leaderboardData.length;

        let avgTime = "N/A";
        const entriesWithTime = leaderboardData.filter(
          (entry) => entry.completionTimeMs,
        );
        if (entriesWithTime.length > 0) {
          const totalTimeMs = entriesWithTime.reduce(
            (sum, entry) => sum + (entry.completionTimeMs || 0),
            0,
          );
          const avgTimeMs = totalTimeMs / entriesWithTime.length;

          const minutes = Math.floor(avgTimeMs / 60000);
          const seconds = Math.floor((avgTimeMs % 60000) / 1000);
          avgTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        }

        setStats({
          averageScore: parseFloat(avgScore.toFixed(2)),
          totalParticipants: leaderboardData.length,
          averageCompletionTime: avgTime,
        });
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast.error("Failed to load leaderboard");
      setLeaderboard([]);
    } finally {
      setIsLoading(false);
    }
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

  const exportToCSV = () => {
    if (!leaderboard.length) return;

    const headers = ["Rank", "Student", "Score", "Completion Time", "Date"];

    const rows = leaderboard.map((entry, index) => [
      `${index + 1}`,
      entry.user ? entry.user.name : entry.name || "Unknown",
      `${entry.score} / ${quiz?._count?.questions || 0}`,
      entry.completionTime || entry.formattedTime || "N/A",
      entry.completedAt
        ? format(new Date(entry.completedAt), "MMM d, h:mm a")
        : "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${quiz?.title || "quiz"}_leaderboard.csv`);
    link.click();
    URL.revokeObjectURL(url);
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
        <Link href={`/teacher/quizzes`} passHref>
          <Button variant="ghost" className="mb-4 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Quizzes
          </Button>
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">{quiz?.title} - Leaderboard</h1>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={exportToCSV}
            disabled={leaderboard.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {quiz && (
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <Badge className="text-sm">{quiz.course.name}</Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{stats.totalParticipants} participants</span>
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

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className={ny("rounded-lg border p-4 text-center")}>
          <h3 className="text-sm font-medium text-muted-foreground">
            Average Score
          </h3>
          <p className="mt-2 text-2xl font-bold">
            {stats.averageScore}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              / {quiz?._count?.questions || 0}
            </span>
          </p>
        </div>

        <div className={ny("rounded-lg border p-4 text-center")}>
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Participants
          </h3>
          <p className="mt-2 text-2xl font-bold">{stats.totalParticipants}</p>
        </div>

        <div className={ny("rounded-lg border p-4 text-center")}>
          <h3 className="text-sm font-medium text-muted-foreground">
            Average Completion Time
          </h3>
          <p className="mt-2 text-2xl font-bold">
            {stats.averageCompletionTime}
          </p>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableCaption>Student rankings for this quiz</TableCaption>
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
                <TableRow key={entry.id || index}>
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
