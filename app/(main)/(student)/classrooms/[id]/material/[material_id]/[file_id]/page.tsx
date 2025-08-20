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
          // extract meaningful information from material_id
          const idParts = String(material_id).split("-");
          if (idParts.length > 1) {
            // last part of the ID
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
