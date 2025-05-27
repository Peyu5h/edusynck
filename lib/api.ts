import { API_URL } from "~/constants/config";

// Helper function to get token from localStorage
const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// User API calls
export const getUserById = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

// Roadmap API calls
export const generateRoadmap = async (userId: string, title?: string) => {
  try {
    const response = await fetch(`${API_URL}/roadmap/generate/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ title }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error generating roadmap:", error);
    throw error;
  }
};

export const getUserRoadmaps = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/roadmap/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user roadmaps:", error);
    throw error;
  }
};

export const getRoadmapById = async (roadmapId: string) => {
  try {
    const response = await fetch(`${API_URL}/roadmap/${roadmapId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    throw error;
  }
};

export const updateTopicStatus = async (topicId: string, status: string) => {
  try {
    const response = await fetch(`${API_URL}/roadmap/topic/${topicId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating topic status:", error);
    throw error;
  }
};

export const regenerateRoadmap = async (roadmapId: string) => {
  try {
    const response = await fetch(`${API_URL}/roadmap/${roadmapId}/regenerate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error regenerating roadmap:", error);
    throw error;
  }
};
