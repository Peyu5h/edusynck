"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Trophy, ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import axios from "axios";

export default function QuizDefaultPage() {
  const { quizId } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [quizTitle, setQuizTitle] = useState("");

  const user = useSelector((state: any) => state.user.user);

  useEffect(() => {
    const fetchQuizTitle = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/${quizId}`,
        );
        if (response.data && response.data.title) {
          setQuizTitle(response.data.title);
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizTitle();
  }, [quizId]);

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Link href="/teacher/quizzes">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Button>
      </Link>

      <h1 className="mb-6 text-2xl font-bold">{quizTitle}</h1>

      <Link href={`/quizzes/${quizId}/leaderboard`}>
        <Button className="w-full justify-start p-6 text-left">
          <Trophy className="mr-4 h-6 w-6" />
          <div>
            <div className="text-lg font-semibold">View Leaderboard</div>
            <div className="text-sm text-muted-foreground">
              Check student rankings and performance
            </div>
          </div>
        </Button>
      </Link>
    </div>
  );
}
