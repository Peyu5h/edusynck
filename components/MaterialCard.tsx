"use client";

import Image from "next/image";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface FileProps {
  id: string;
  title: string;
  alternateLink: string;
  thumbnailUrl: string;
  extension: string;
}

interface LinkProps {
  url: string;
  title: string;
  thumbnailUrl: string;
}

interface MaterialCardProps {
  material: FileProps | LinkProps;
  type: "file" | "link";
}

const MaterialCard: React.FC<MaterialCardProps> = ({ material, type }) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const pathname = usePathname();
  const classId = pathname.split("/").filter(Boolean)[1];

  if (!material) {
    return null;
  }

  const getTitle = () => {
    if (type === "file") {
      return (material as FileProps).title;
    } else {
      return (material as LinkProps).title;
    }
  };

  const getThumbnailUrl = () => {
    if (type === "file") {
      const file = material as FileProps;
      return file.thumbnailUrl
        ? `${backendUrl}/api/admin/image?thumbnailUrl=${file.thumbnailUrl}`
        : "/path/to/default/file/icon.png"; // Replace with your default file icon
    } else {
      const link = material as LinkProps;
      return link.thumbnailUrl || "/path/to/default/link/icon.png"; // Replace with your default link icon
    }
  };

  const getLink = () => {
    if (type === "file") {
      return (material as FileProps).alternateLink;
    } else {
      return (material as LinkProps).url;
    }
  };

  const formatDescription = (description: string, maxLength = 100): string => {
    const truncated =
      description.length > maxLength
        ? `${description.slice(0, maxLength)}...`
        : description;
    return truncated;
  };

  return (
    <a
      href={getLink()}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full"
    >
      <div className="w-full overflow-hidden rounded-lg border-[1px] border-transparent bg-bground2 duration-150 hover:border-[1px] hover:border-zinc-700">
        <div className="flex p-4">
          <div className="thumbnail-container relative h-28 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-white">
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src={getThumbnailUrl()}
                alt={getTitle()}
                width={80}
                height={112}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
          <div className="ml-4 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-light text-text">
                {formatDescription(getTitle(), 54)}
              </h2>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                {type === "file" ? "File" : "Link"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
};

export default MaterialCard;
