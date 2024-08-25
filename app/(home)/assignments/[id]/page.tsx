"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { sidebarExpandedAtom } from "~/context/atom";
import DocView from "~/components/DocView";
import { useParams, useRouter } from "next/navigation";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Button } from "~/components/ui/button";

export default function AssignmentPage() {
  const [isSidebarExpanded, setIsSidebarExpanded] =
    useAtom(sidebarExpandedAtom);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const { id } = useParams();

  useEffect(() => {
    setIsSidebarExpanded(false);
  }, [setIsSidebarExpanded]);

  useEffect(() => {
    const fetchFile = async () => {
      if (!id) return;

      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/file/${id}`;

      try {
        const response = await fetch(url, { method: "HEAD" });
        if (response.ok) {
          setFileUrl(url);
          const contentType = response.headers.get("Content-Type");
          setFileType(getSimpleFileType(contentType));
        } else {
          console.error("Failed to fetch file information");
        }
      } catch (error) {
        console.error("Error fetching file:", error);
      }
    };

    fetchFile();
  }, [id]);

  const getSimpleFileType = (mimeType: string | null): string => {
    if (!mimeType) return "unknown";

    const mimeTypeMap: { [key: string]: string } = {
      "application/pdf": "pdf",
      "application/msword": "doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "docx",
      "application/vnd.ms-excel": "xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "xlsx",
      "application/vnd.ms-powerpoint": "ppt",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        "pptx",
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/gif": "gif",
      "text/plain": "txt",
    };

    return mimeTypeMap[mimeType] || "unknown";
  };

  return (
    <div>
      <div className="flex h-[80vh] w-full cursor-pointer justify-between rounded-lg bg-bground2 p-4">
        <div className="deadline">
          <DocView uri={fileUrl} fileType={fileType} />
        </div>
      </div>
    </div>
  );
}
