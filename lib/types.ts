export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  classId: string;
  class: any[];
  notifications?: any[];
  assignments?: any[];
  votedPolls?: any[];
  createdPolls?: any[];
  streak?: {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string;
    activityLog: Array<{
      date: string;
      count: number;
    }>;
  };
}

export interface Course {
  id: string;
  name: string;
  googleClassroomId: string;
  classId: string;
  professorName?: string;
  professorProfilePicture?: string;
}

export interface Material {
  id: string;
  title: string;
  alternateLink: string;
  files: {
    id: string;
    title: string;
    alternateLink: string;
    thumbnailUrl: string;
    extension: string;
  }[];
  links: {
    url: string;
    title: string;
    thumbnailUrl: string;
  }[];
}

export interface Message {
  id: string;
  sender: { id: string; name: string };
  content: string;
  files?: any[];
  createdAt: string;
}

export interface UserActivity {
  date: string;
  count: number;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  startTime: string | null;
  endTime: string | null;
  duration: number | null;
  createdAt: string;
  course: {
    id: string;
    name: string;
  };
  _count: {
    questions: number;
  };
  hasAttempted?: boolean;
  attemptStatus?: string | null;
}

export interface StudentAttempt {
  id: string;
  quizId: string;
  startedAt: string;
  completedAt: string | null;
  score: number;
  status: string;
  quiz: {
    title: string;
    course: {
      name: string;
    };
  };
}

export interface LeaderboardEntry {
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

export interface Quiz_user {
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
