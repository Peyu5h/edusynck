"use client";

import { useAtom } from "jotai";
import React, { useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import SubjectCardLoader from "~/components/Loaders/SubjectCardLoader";
import SubjectCard from "~/components/SubjectCard";
import { sidebarExpandedAtom } from "~/context/atom";
import { useCourses } from "~/hooks/useGetCourses";
import { useUser } from "~/hooks/useUser";

interface ClassRoomProp {
  id: string;
  name: string;
  classId: string;
  googleClassroomId: string;
  professorName?: string;
  professorProfilePicture?: string;
}

const Page: React.FC = () => {
  const { user } = useUser();
  console.log(user);

  const { data: courses, isLoading, error } = useCourses();
  console.log(courses);

  const [isSidebarExpanded, setIsSidebarExpanded] =
    useAtom(sidebarExpandedAtom);

  useEffect(() => {
    setIsSidebarExpanded(true);
  }, [setIsSidebarExpanded]);

  const loaders = Array.from({ length: 5 });

  return (
    <div>
      <div className="">
        <h1 className="pb-4 pt-2 text-3xl font-light text-text">
          Your classrooms
        </h1>
      </div>
      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 xl:gap-6">
        {isLoading ? (
          loaders.map((_, index) => <SubjectCardLoader key={index} />)
        ) : error ? (
          <p>Error: {error.message || "An error occurred"}</p>
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
