"use client";

import { useAtom } from "jotai";
import React, { useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import SubjectCardLoader from "~/components/Loaders/SubjectCardLoader";
import SubjectCard from "~/components/SubjectCard";
import { sidebarExpandedAtom } from "~/context/atom";

interface ClassRoomProp {
  id: string;
  name: string;
  classId: string;
  googleClassroomId: string;
  professorName?: string;
  professorProfilePicture?: string;
}

const Page: React.FC = () => {
  const user = useSelector((state: any) => state.user.user);
  const classId = user?.classId;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [isSidebarExpanded, setIsSidebarExpanded] =
    useAtom(sidebarExpandedAtom);
  const [courses, setCourses] = React.useState<ClassRoomProp[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    setIsSidebarExpanded(true);
  }, [setIsSidebarExpanded]);

  const fetchData = useCallback(async () => {
    if (!classId) {
      console.log("No classId available");
      setError("No class ID available");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log(`Fetching courses for classId: ${classId}`);
      const response = await fetch(
        `${backendUrl}/api/class/${classId}/courses`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched courses:", data);
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to fetch courses. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [classId, backendUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    console.log("Courses state updated:", courses);
  }, [courses]);

  const loaders = Array.from({ length: 5 });

  return (
    <div>
      <div className="">
        <h1 className="pb-4 pt-2 text-3xl font-light text-text">
          Your classrooms
        </h1>
      </div>
      <div className="grid w-full grid-cols-3 gap-6">
        {isLoading ? (
          loaders.map((_, index) => <SubjectCardLoader key={index} />)
        ) : error ? (
          <p>Error: {error}</p>
        ) : Array.isArray(courses) && courses.length > 0 ? (
          courses.map((course) => (
            <SubjectCard key={course.id} course={course} />
          ))
        ) : (
          <p>No courses available</p>
        )}
      </div>
    </div>
  );
};

export default Page;
