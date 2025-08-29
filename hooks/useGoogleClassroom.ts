import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Hook to fetch all Google Classroom courses
export const useGoogleClassroomCourses = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["google-classroom-courses"],
    queryFn: async () => {
      // Get token from cookies more reliably
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/all-courses`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          },
        );
        return response.data;
      } catch (error: any) {
        return [];
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Hook to create a new class
export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (classData: {
      name: string;
      classNumber: string;
      selectedCourses: string[];
    }) => {
      console.log("🚀 Starting class creation mutation...");

      // Get token from cookies
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      // First create the class
      const classResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/class/create`,
        {
          name: classData.name,
          classNumber: classData.classNumber,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );

      const newClassId = classResponse.data.classId;

      // Then assign selected courses to the class
      if (classData.selectedCourses.length > 0) {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/class/${newClassId}/assign-courses`,
          {
            courseIds: classData.selectedCourses,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          },
        );
      }

      console.log("✅ Class creation API calls successful");
      return { classId: newClassId, ...classResponse.data };
    },
    retry: 1, // Allow one retry for 401 errors
    onSuccess: () => {
      console.log("🎉 Class creation mutation successful!");

      // Just invalidate React Query cache - Redux update handled in component
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["google-classroom-courses"] });

      console.log("✅ Cache invalidation completed");
    },
    onError: (error) => {
      console.error("❌ Class creation mutation failed:", error);
    },
  });
};

// Hook to assign courses to an existing class
export const useAssignCourses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      classId,
      courseIds,
    }: {
      classId: string;
      courseIds: string[];
    }) => {
      console.log("🚀 Starting course assignment mutation...");

      // Get token from cookies
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/class/${classId}/assign-courses`,
        {
          courseIds,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );

      console.log("✅ Course assignment API call successful");
      return response.data;
    },
    retry: 1, // Allow one retry for 401 errors
    onSuccess: () => {
      console.log("🎉 Course assignment mutation successful!");

      // Just invalidate React Query cache - Redux update handled in component
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["google-classroom-courses"] });

      console.log("✅ Cache invalidation completed");
    },
    onError: (error) => {
      console.error("❌ Course assignment mutation failed:", error);
    },
  });
};

// Hook to delete a course from a class
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      classId,
      courseId,
    }: {
      classId: string;
      courseId: string;
    }) => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/class/${classId}/courses/${courseId}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );
      return response.data;
    },
    retry: 1,
    onSuccess: () => {
      console.log("🎉 Course deletion mutation successful!");

      // Invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["google-classroom-courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });

      console.log("✅ Cache invalidation completed");
    },
    onError: (error) => {
      console.error("❌ Course deletion mutation failed:", error);
    },
  });
};

// Helper function to get available courses (not already assigned to any class)
export const useAvailableGoogleClassroomCourses = (
  existingCourses: any[] = [],
  enabled: boolean = true,
) => {
  const { data: allCourses, ...rest } = useGoogleClassroomCourses(enabled);

  const availableCourses =
    allCourses?.filter(
      (course: any) =>
        !existingCourses.some(
          (existing: any) => existing.googleClassroomId === course.id,
        ),
    ) || [];

  return {
    data: availableCourses,
    ...rest,
  };
};
