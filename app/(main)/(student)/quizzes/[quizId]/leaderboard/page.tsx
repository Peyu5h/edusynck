"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LeaderboardEntry, Quiz_user } from "~/lib/types";
import LeaderboardHeader from "~/components/Quiz/LeaderboardHeader";
import LeaderboardTable from "~/components/Quiz/LeaderboardTable";
import { QuizLeaderboardLoader } from "~/components/Loaders";
import { useQuizData, useQuizLeaderboard } from "~/hooks/useQuizData";

export default function QuizLeaderboardPage() {
  const { quizId } = useParams();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Use React Query hooks for data fetching
  const { data: quiz, isLoading: isLoadingQuiz } = useQuizData(
    quizId as string,
  );
  const { data: leaderboardData, isLoading: isLoadingLeaderboard } =
    useQuizLeaderboard(quizId as string);

  const isLoading = isLoadingQuiz || isLoadingLeaderboard;
  const leaderboard = leaderboardData?.leaderboard || leaderboardData || [];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
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
  }, []);

  if (isLoading) {
    return <QuizLeaderboardLoader />;
  }

  const router = useRouter();
  return (
    <div className="container mx-auto">
      <div className="mb-4 mt-4">
        <Button
          className="mb-4"
          variant="outline"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Button>

        {quiz && (
          <LeaderboardHeader
            title={quiz.title}
            courseName={quiz.course.name}
            participants={Array.isArray(leaderboard) ? leaderboard.length : 0}
            topScoreText={
              Array.isArray(leaderboard) && leaderboard.length > 0
                ? String(leaderboard[0].score)
                : "N/A"
            }
          />
        )}
      </div>

      <LeaderboardTable
        rows={Array.isArray(leaderboard) ? leaderboard : []}
        currentUserId={currentUserId || undefined}
        totalQuestions={quiz?._count?.questions || 0}
      />
    </div>
  );
}
