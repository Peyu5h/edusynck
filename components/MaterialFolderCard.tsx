"use client";

import Image from "next/image";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface MaterialCardProps {
  material: {
    id: string;
    title: string;
    alternateLink: string;
    thumbnailUrl?: string;
    description?: string;
    files: {
      id: string;
      title: string;
      alternateLink: string;
      thumbnailUrl: string;
      extension: string;
    }[];
    links: any[];
  };
}

const MaterialFolderCard: React.FC<MaterialCardProps> = ({ material }) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const pathname = usePathname();
  const classId = pathname.split("/").filter(Boolean).pop();

  const pdf =
    "https://res.cloudinary.com/dkysrpdi6/image/upload/v1724677149/Academia/pdfFile_ofn3cu.png";
  const docx =
    "https://res.cloudinary.com/dkysrpdi6/image/upload/v1724677151/Academia/folder_tyuwju.png";
  const link =
    "https://res.cloudinary.com/dkysrpdi6/image/upload/v1724677150/Academia/linkFolder_rs6typ.png";
  const image =
    "https://res.cloudinary.com/dkysrpdi6/image/upload/v1724677153/Academia/imgFolder_kbqjag.png";
  if (!material) {
    return null;
  }

  const fileCount = material.files.length;
  const linkCount = material.links.length;

  const thumbnailUrl =
    material.files[0]?.extension === "pdf"
      ? pdf
      : material.files[0]?.extension === "docx"
        ? docx
        : material.links[0]?.url
          ? link
          : material.files[0]?.extension === "image"
            ? image
            : "https://res.cloudinary.com/dkysrpdi6/image/upload/v1724677151/Academia/folder_tyuwju.png";

  const formatDescription = (
    description: string | undefined | null,
    maxLength = 100,
  ): string => {
    if (!description) {
      return "";
    }

    const truncated =
      description.length > maxLength
        ? `${description.slice(0, maxLength)}...`
        : description;

    return `${truncated}`;
  };

  if (fileCount == 0 && linkCount == 0) {
    return null;
  }

  return (
    <Link
      href={`/classrooms/${classId}/material/${material.id}`}
      className="block w-full"
    >
      <div className="w-full overflow-hidden rounded-lg border-[1px] border-transparent bg-bground2 duration-150 hover:border-[1px] hover:border-zinc-700">
        <div className="flex p-4">
          <div className="thumbnail-container relative h-28 w-20 flex-shrink-0 overflow-hidden rounded-lg">
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src={thumbnailUrl}
                alt={material.title}
                width={80}
                height={112}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
          <div className="ml-6 flex flex-col justify-center">
            <div>
              <h2 className="text-xl font-light text-text">
                {formatDescription(material.title, 54)}
              </h2>
              <p className="text-sm font-normal text-thintext">
                {fileCount} files, {linkCount} links
              </p>
            </div>
            {/* <h1 className="mt-2 text-sm font-normal text-thintext">hehehe</h1> */}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MaterialFolderCard;
