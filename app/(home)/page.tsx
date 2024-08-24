"use client";

import { useAtom } from "jotai";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import UserButton from "~/components/Header/UserButton/UserButton";
import SubjectCardLoader from "~/components/Loaders/SubjectCardLoader";
import SubjectCard from "~/components/SubjectCard";
import { sidebarExpandedAtom } from "~/context/atom";

interface classRoomProp {
  id: string;
  name: string;
  classId: string;
  googleClassroomId: string;
  professorName?: string;
  professorProfilePicture?: string;
}

const Page = () => {
  const user = useSelector((state: any) => state.user.user);

  const classId = user?.classId;
  console.log(classId);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [isSidebarExpanded, setIsSidebarExpanded] =
    useAtom(sidebarExpandedAtom);

  useEffect(() => {
    setIsSidebarExpanded(true);
  }, [setIsSidebarExpanded]);

  const [courses, setCourses] = React.useState<classRoomProp[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    try {
      const fetchData = async () => {
        setIsLoading(true);
        const response = await fetch(
          `${backendUrl}/api/class/${classId}/courses`,
        );
        const data = await response.json();
        setCourses(data);
        setIsLoading(false);
      };
      fetchData();
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }, [classId]);

  return (
    <div>
      <div className="">
        <h1 className="pb-4 pt-2 text-3xl font-light text-text">
          Your classrooms
        </h1>
      </div>
      <div className="grid w-full grid-cols-3 gap-6">
        {isLoading ? (
          <SubjectCardLoader />
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
