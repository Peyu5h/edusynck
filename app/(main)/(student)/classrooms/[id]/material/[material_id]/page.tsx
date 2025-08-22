"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ClassroomBread } from "~/components/BreadCrump/ClassroomBread";
import MaterialLoader from "~/components/Loaders/MaterialLoader";
import MaterialCard from "~/components/MaterialCard";
import { Material } from "~/lib/types";

interface Course {
  id: string;
  name: string;
  googleClassroomId: string;
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
    const fetchCourseAndMaterial = async () => {
      if (!courseId || !materialId) return;
      setIsLoading(true);
      try {
        // courses
        const courseResponse = await fetch(
          `${backendUrl}/api/class/${courseId}`,
        );
        if (!courseResponse.ok) {
          throw new Error("Failed to fetch course");
        }
        const courseData = await courseResponse.json();
        setCourse(courseData);

        // materials
        const materialsResponse = await fetch(
          `${backendUrl}/api/class/${courseId}/course/${courseData.googleClassroomId}/materials`,
        );
        if (!materialsResponse.ok) {
          throw new Error("Failed to fetch materials");
        }
        const materialsData = await materialsResponse.json();

        // specific material
        const specificMaterial = materialsData.find(
          (m: Material) => m.id === materialId,
        );
        if (!specificMaterial) {
          throw new Error("Material not found");
        }
        setMaterial(specificMaterial);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load course or material information.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseAndMaterial();
  }, [courseId, materialId, backendUrl]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (isLoading) {
    return <MaterialLoader />;
  }

  return (
    <div>
      <ClassroomBread
        courseName={course?.name}
        materialName={material?.title}
      />
      {material && (
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {material.files.length > 0 &&
              material.files.map((file: any) => (
                <div key={file.id} className="min-h-[180px]">
                  <MaterialCard
                    material={file}
                    type="file"
                    title={material.title}
                  />
                </div>
              ))}
            {material.links.length > 0 &&
              material.links.map((link, index) => (
                <div key={index} className="min-h-[180px]">
                  <MaterialCard
                    material={link}
                    type="link"
                    title={material.title}
                  />
                </div>
              ))}
            {material.files.length === 0 && material.links.length === 0 && (
              <div className="col-span-full flex items-center justify-center py-12">
                <p className="text-lg text-muted-foreground">
                  No files or links available for this material.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
