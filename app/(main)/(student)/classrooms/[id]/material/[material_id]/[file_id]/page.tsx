"use client";

import { useAtom } from "jotai";
import { useParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";
import axios from "axios";

import MaterialView from "~/components/MaterialView";
import DocumentLoader from "~/components/Loaders/DocumentLoader";
import { sidebarExpandedAtom } from "~/context/atom";
import { useFile } from "~/hooks/useFile";

const MaterialContent = () => {
  const { id: courseId, material_id, file_id } = useParams();
  const [, setIsSidebarExpanded] = useAtom(sidebarExpandedAtom);
  const {
    fileUrl,
    fileType,
    isLoading: fileLoading,
    error: fileError,
  } = useFile(file_id);
  const [materialName, setMaterialName] = useState<string>("");
  const [isLoadingMaterial, setIsLoadingMaterial] = useState(true);

  useEffect(() => {
    setIsSidebarExpanded(false);

    const fetchMaterialName = async () => {
      try {
        if (material_id) {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/material/${material_id}`,
          );
          if (response.data.success) {
            setMaterialName(response.data.data.name);
          }
        }
      } catch (error) {
        console.error("Failed to fetch material name:", error);
        if (material_id) {
          const idParts = String(material_id).split("-");
          if (idParts.length > 1) {
            setMaterialName(`Study Material ${idParts[idParts.length - 1]}`);
          } else {
            setMaterialName(`Study Material ${material_id.slice(0, 8)}`);
          }
        }
      } finally {
        setIsLoadingMaterial(false);
      }
    };

    fetchMaterialName();
  }, [setIsSidebarExpanded, material_id]);

  if (isLoadingMaterial || fileLoading) {
    return <DocumentLoader message="Loading document..." showProgress={true} />;
  }

  if (fileError || !fileUrl) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <p className="text-lg font-medium text-destructive">
            Failed to load document
          </p>
          <p className="text-sm text-muted-foreground">
            {fileError || "Document not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-background p-2">
      <div className="h-full w-full max-w-[1800px] rounded-lg shadow-lg">
        <MaterialView
          uri={fileUrl}
          fileType={fileType}
          materialName={materialName || `Material ${material_id}`}
          courseId={Array.isArray(courseId) ? courseId[0] : courseId}
        />
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense
      fallback={<DocumentLoader message="Initializing document viewer..." />}
    >
      <MaterialContent />
    </Suspense>
  );
};

export default Page;
