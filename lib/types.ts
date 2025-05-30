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

export interface UserActivity {
  date: string;
  count: number;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}
