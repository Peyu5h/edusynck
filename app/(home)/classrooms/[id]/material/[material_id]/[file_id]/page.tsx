"use client";

import { useAtom } from "jotai";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";

import MaterialView from "~/components/MaterialView";
import { sidebarExpandedAtom } from "~/context/atom";
import { useFile } from "~/hooks/useFile";

const Page = () => {
  const { id: courseId, material_id, file_id } = useParams();
  const [, setIsSidebarExpanded] = useAtom(sidebarExpandedAtom);
  const { fileUrl, fileType } = useFile(file_id);
  const [materialName, setMaterialName] = useState<string>("");

  useEffect(() => {
    setIsSidebarExpanded(false);

    // Fetch material name if we have material_id
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
        // Set a default name if we fail to fetch from API
        if (material_id) {
          // Try to extract meaningful information from material_id
          const idParts = String(material_id).split("-");
          if (idParts.length > 1) {
            // Use the last part of the ID which might contain more readable info
            setMaterialName(`Study Material ${idParts[idParts.length - 1]}`);
          } else {
            setMaterialName(`Study Material ${material_id.slice(0, 8)}`);
          }
        }
      }
    };

    fetchMaterialName();
  }, [setIsSidebarExpanded, material_id]);

  return (
    <div className="scrollbar h-[75vh] w-full p-0 sm:p-4">
      <MaterialView
        uri={fileUrl}
        fileType={fileType}
        materialName={materialName || `Material ${material_id}`}
        courseId={Array.isArray(courseId) ? courseId[0] : courseId}
      />
    </div>
  );
};

export default Page;
