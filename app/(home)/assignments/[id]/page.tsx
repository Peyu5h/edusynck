"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { sidebarExpandedAtom } from "~/context/atom";
import { useParams } from "next/navigation";
import { useFile } from "~/hooks/useFile";
import MaterialView from "~/components/MaterialView";
import axios from "axios";

export default function AssignmentPage() {
  const [, setIsSidebarExpanded] = useAtom(sidebarExpandedAtom);
  const { id } = useParams();
  const { fileUrl, fileType } = useFile(id);
  const [assignmentName, setAssignmentName] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("");

  useEffect(() => {
    setIsSidebarExpanded(false);

    // Fetch assignment and course info
    const fetchAssignmentInfo = async () => {
      try {
        if (id) {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/assignments/${id}`,
          );
          if (response.data.success) {
            setAssignmentName(response.data.data.title || "Assignment");
            setCourseId(response.data.data.courseId);
          }
        }
      } catch (error) {
        console.error("Failed to fetch assignment info:", error);
        // Set fallback values
        setAssignmentName(`Assignment ${id}`);
        // Attempt to find courseId in URL
        const pathParts = window.location.pathname.split("/");
        const possibleCourseIndex = pathParts.findIndex(
          (part) => part === "classrooms",
        );
        if (
          possibleCourseIndex >= 0 &&
          possibleCourseIndex + 1 < pathParts.length
        ) {
          setCourseId(pathParts[possibleCourseIndex + 1]);
        }
      }
    };

    fetchAssignmentInfo();
  }, [setIsSidebarExpanded, id]);

  return (
    <div>
      <div className="flex h-[75vh] w-full cursor-pointer justify-between rounded-lg bg-bground2 p-4">
        <div className="w-full">
          <MaterialView
            uri={fileUrl}
            fileType={fileType}
            materialName={assignmentName}
            courseId={courseId}
          />
        </div>
      </div>
    </div>
  );
}
