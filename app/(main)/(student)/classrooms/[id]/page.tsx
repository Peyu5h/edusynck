"use client";

import { useAtom } from "jotai";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ClassroomBread } from "~/components/BreadCrump/ClassroomBread";
import AssignmentLoader from "~/components/Loaders/AssignmentLoader";
import MaterialLoader from "~/components/Loaders/MaterialLoader";
import MaterialCard from "~/components/MaterialCard";
import MaterialFolderCard from "~/components/MaterialFolderCard";
import { sidebarExpandedAtom } from "~/context/atom";
import { useUser } from "~/hooks/useUser";

interface Course {
  id: string;
  name: string;
  googleClassroomId: string;
  classId: string;
  professorName?: string;
  professorProfilePicture?: string;
}

interface Material {
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
  links: any[];
}

const Page = () => {
  const { id } = useParams() || {};
  const [course, setCourse] = useState<Course | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] =
    useAtom(sidebarExpandedAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [materials, setMaterials] = useState<Material[]>([]);

  const { user } = useUser();
  const classId = user?.classId;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchCourses = async () => {
      if (!id) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/class/${id}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        setCourse(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, [id]);

  useEffect(() => {
    setIsSidebarExpanded(true);
  }, [setIsSidebarExpanded]);

  useEffect(() => {
    const fetchAssignments = async () => {
      console.log("Fetching assignments...");
      console.log("classId:", classId);
      console.log("course?.googleClassroomId:", course?.googleClassroomId);

      if (!classId || !course?.googleClassroomId) {
        console.log("Missing classId or googleClassroomId, skipping fetch");
        setMaterials([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const url = `${backendUrl}/api/class/${classId}/course/${course.googleClassroomId}/materials`;
        console.log("Fetching from URL:", url);
        const response = await fetch(url, { cache: "force-cache" });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched materials:", data);
        setMaterials(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching materials:", error);
        setMaterials([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [classId, backendUrl, course?.googleClassroomId]);

  if (!id) {
    return <div>No id</div>;
  }

  return (
    <div>
      <ClassroomBread courseName={course?.name} />
      {isLoading ? (
        <div className="mt-6">
          <MaterialLoader />
        </div>
      ) : materials.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <MaterialFolderCard key={material.id} material={material} />
          ))}
        </div>
      ) : (
        <div>
          <MaterialLoader />
        </div>
      )}
    </div>
  );
};

export default Page;
