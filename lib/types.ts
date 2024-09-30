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
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}
