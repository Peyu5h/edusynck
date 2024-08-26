"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ClassroomBread } from "~/components/BreadCrump/ClassroomBread";
import MaterialLoader from "~/components/Loaders/MaterialLoader";

interface Course {
  id: string;
  name: string;
  googleClassroomId: string;
  // Add other course properties as needed
}

interface Material {
  title: string;
  // Add other material properties as needed
}

export default function MaterialPage() {
  const params = useParams();
  const courseId = params.id as string;
  const materialId = params.material_id as string;

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [course, setCourse] = useState<Course | null>(null);
  const [material, setMaterial] = useState<Material | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      try {
        const response = await fetch(`${backendUrl}/api/class/${courseId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch course");
        }
        const data = await response.json();
        setCourse(data);
      } catch (error) {
        console.error("Error fetching course:", error);
        setError("Failed to load course information.");
      }
    };

    fetchCourse();
  }, [courseId, backendUrl]);

  useEffect(() => {
    const fetchMaterial = async () => {
      if (!course || !materialId) return;

      try {
        const url = `${backendUrl}/api/class/${courseId}/course/${course.googleClassroomId}/material/${materialId}`;
        console.log("Fetching material from:", url);

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMaterial(data);
      } catch (e) {
        console.error("Failed to fetch material:", e);
        setError(
          "Failed to load material. It may not exist or you may not have permission to view it.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (course) {
      fetchMaterial();
    }
  }, [course, materialId, courseId, backendUrl]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <ClassroomBread
        courseName={course?.name}
        materialName={material?.title}
      />
      {isLoading ? <MaterialLoader /> : <div className="mt-8">Materials</div>}
    </div>
  );
}
