import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Quiz data hook
export const useQuizData = (quizId: string, userId?: string) => {
  return useQuery({
    queryKey: ["quiz", quizId, userId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/quiz/${quizId}${userId ? `?userId=${userId}` : ""}`,
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
      const response = await axios.get(`/api/quiz/attempt/${attemptId}`);
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
        `/api/quiz/attempt/${attemptId}/answers`,
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
        `/api/quiz/attempt/${attemptId}/results`,
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
      const response = await axios.get(`/api/quiz/${quizId}/leaderboard`);
      return response.data;
    },
    enabled: !!quizId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Active quizzes hook
export const useActiveQuizzes = (courseId?: string, userId?: string) => {
  return useQuery({
    queryKey: ["active-quizzes", courseId, userId],
    queryFn: async () => {
      let url = `/api/quiz/active`;
      const params = new URLSearchParams();

      if (courseId) {
        params.append("courseId", courseId);
      }
      if (userId) {
        params.append("userId", userId);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log("Fetching active quizzes from:", url);
      const response = await axios.get(url);
      console.log("Active quizzes response:", response.data);
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
      const response = await axios.get(`/api/quiz/student/${userId}/attempts`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Teacher quizzes hook
export const useTeacherQuizzes = (courseId: string) => {
  return useQuery({
    queryKey: ["teacher-quizzes", courseId],
    queryFn: async () => {
      const response = await axios.get(`/api/quiz/course/${courseId}`);
      return response.data;
    },
    enabled: !!courseId,
    staleTime: 1 * 60 * 1000, // 1 minute - shorter for teachers to see updates faster
  });
};

// Teacher active quizzes with attempt counts hook
export const useTeacherActiveQuizzes = (courses: any[]) => {
  return useQuery({
    queryKey: ["teacher-active-quizzes", courses.map((c) => c.id).sort()],
    queryFn: async () => {
      if (!courses.length) return [];

      // Fetch active quizzes for all courses
      const promises = courses.map(async (course) => {
        try {
          const response = await axios.get(`/api/quiz/course/${course.id}`);
          const quizzes = response.data?.success
            ? response.data.data
            : response.data || [];

          // Filter only active quizzes and add attempt counts
          const activeQuizzes = quizzes.filter(
            (quiz: any) => quiz.status === "ACTIVE",
          );

          // Fetch attempt counts for each active quiz
          const quizzesWithCounts = await Promise.all(
            activeQuizzes.map(async (quiz: any) => {
              try {
                const progressResponse = await axios.get(
                  `/api/quiz/${quiz.id}/progress`,
                );
                const progress = progressResponse.data?.success
                  ? progressResponse.data.progress
                  : null;

                return {
                  ...quiz,
                  _count: {
                    ...quiz._count,
                    attempts: progress?.attempted || 0,
                    completed: progress?.completed || 0,
                  },
                };
              } catch (error) {
                console.error(
                  `Error fetching progress for quiz ${quiz.id}:`,
                  error,
                );
                return quiz;
              }
            }),
          );

          return quizzesWithCounts;
        } catch (error) {
          console.error(
            `Error fetching quizzes for course ${course.id}:`,
            error,
          );
          return [];
        }
      });

      const results = await Promise.all(promises);
      return results.flat();
    },
    enabled: courses.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
