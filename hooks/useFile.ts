import { useState, useEffect } from "react";

function getSimpleFileType(mimeType: string | null): string {
  if (!mimeType) return "unknown";

  const mimeTypeMap: { [key: string]: string } = {
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "pptx",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "text/plain": "txt",
  };

  return mimeTypeMap[mimeType] || "unknown";
}

export function useFile(id: string | string[] | undefined) {
  const [fileUrl, setFileUrl] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");

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

  return { fileUrl, fileType };
}
