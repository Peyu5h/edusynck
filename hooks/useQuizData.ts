import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Quiz data hook
export const useQuizData = (quizId: string, userId?: string) => {
  return useQuery({
    queryKey: ["quiz", quizId, userId],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/${quizId}${userId ? `?userId=${userId}` : ""}`,
      );
      return response.data;
    },
    enabled: !!quizId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Quiz attempt hook
export const useQuizAttempt = (attemptId: string) => {
  return useQuery({
    queryKey: ["quiz-attempt", attemptId],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/attempt/${attemptId}`,
      );
      return response.data;
    },
    enabled: !!attemptId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Quiz answers hook
export const useQuizAnswers = (attemptId: string) => {
  return useQuery({
    queryKey: ["quiz-answers", attemptId],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/attempt/${attemptId}/answers`,
      );
      return response.data;
    },
    enabled: !!attemptId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Quiz results hook
export const useQuizResults = (attemptId: string) => {
  return useQuery({
    queryKey: ["quiz-results", attemptId],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/attempt/${attemptId}/results`,
      );
      return response.data;
    },
    enabled: !!attemptId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Quiz leaderboard hook
export const useQuizLeaderboard = (quizId: string) => {
  return useQuery({
    queryKey: ["quiz-leaderboard", quizId],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/${quizId}/leaderboard`,
      );
      return response.data;
    },
    enabled: !!quizId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Active quizzes hook
export const useActiveQuizzes = (courseId?: string) => {
  return useQuery({
    queryKey: ["active-quizzes", courseId],
    queryFn: async () => {
      let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/active`;
      if (courseId) {
        url += `?courseId=${courseId}`;
      }
      const response = await axios.get(url);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Student attempts hook
export const useStudentAttempts = (userId: string) => {
  return useQuery({
    queryKey: ["student-attempts", userId],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/student/${userId}/attempts`,
      );
      return response.data;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
