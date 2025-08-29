"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import LeaderboardHeader from "~/components/Quiz/LeaderboardHeader";
import LeaderboardTable from "~/components/Quiz/LeaderboardTable";
import { QuizLeaderboardLoader } from "~/components/Loaders";
import { useQuizData, useQuizLeaderboard } from "~/hooks/useQuizData";

export default function TeacherQuizLeaderboardPage() {
  const { quizId } = useParams();
  const router = useRouter();

  const { data: quiz, isLoading: isLoadingQuiz } = useQuizData(
    quizId as string,
  );
  const { data: leaderboardData, isLoading: isLoadingLeaderboard } =
    useQuizLeaderboard(quizId as string);

  const isLoading = isLoadingQuiz || isLoadingLeaderboard;
  const leaderboard = useMemo(() => {
    const raw = leaderboardData?.leaderboard || leaderboardData || [];
    return Array.isArray(raw) ? raw : [];
  }, [leaderboardData]);

  const averageScore = useMemo(() => {
    if (!leaderboard.length) return 0;
    const total = leaderboard.reduce(
      (sum: number, e: any) => sum + (e.score || 0),
      0,
    );
    return parseFloat((total / leaderboard.length).toFixed(2));
  }, [leaderboard]);

  if (isLoading) {
    return <QuizLeaderboardLoader />;
  }

  const exportToCSV = () => {
    if (!leaderboard.length) return;
    const headers = ["Rank", "Student", "Score", "Completion Time"];
    const rows = leaderboard.map((entry: any, index: number) => [
      `${index + 1}`,
      entry.user ? entry.user.name : entry.name || "Unknown",
      `${entry.score} / ${quiz?._count?.questions || 0}`,
      entry.completionTime || entry.formattedTime || "N/A",
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${quiz?.title || "quiz"}_leaderboard.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto">
      <div className="mb-4 mt-4">
        <Button
          variant="outline"
          onClick={() => router.push("/teacher/quizzes")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Button>
      </div>

      {quiz && (
        <div className="mb-6 space-y-3 rounded-xl bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <LeaderboardHeader
              title={quiz.title}
              courseName={quiz.course?.name}
              participants={Array.isArray(leaderboard) ? leaderboard.length : 0}
              topScoreText={
                Array.isArray(leaderboard) && leaderboard.length > 0
                  ? String(leaderboard[0].score)
                  : "N/A"
              }
            />
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="border-green-200 rounded-lg border bg-bground3 p-4 text-center">
              <h3 className="text-sm font-medium text-muted-foreground">
                Top score
              </h3>
              <p className="mt-2 text-2xl font-bold">
                {Array.isArray(leaderboard) && leaderboard.length > 0
                  ? String(leaderboard[0].score)
                  : "N/A"}
              </p>
            </div>
            <div className="border-green-200 rounded-lg border bg-bground3 p-4 text-center">
              <h3 className="text-sm font-medium text-muted-foreground">
                Average Score
              </h3>
              <p className="mt-2 text-2xl font-bold">{averageScore}</p>
            </div>
            <div className="border-green-200 rounded-lg border bg-bground3 p-4 text-center">
              <h3 className="text-sm font-medium text-muted-foreground">
                Total Participants
              </h3>
              <p className="mt-2 text-2xl font-bold">
                {Array.isArray(leaderboard) ? leaderboard.length : 0}
              </p>
            </div>
          </div>
        </div>
      )}

      <LeaderboardTable
        rows={Array.isArray(leaderboard) ? leaderboard : []}
        totalQuestions={quiz?._count?.questions || 0}
      />
    </div>
  );
}
