"use client";

import Image from "next/image";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { IoIosArrowRoundForward } from "react-icons/io";

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
  title: string;
}

const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  type,
  title,
}) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (fileId: string) => {
    router.push(`${pathname}/${fileId}`);
  };

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
        : "https://res.cloudinary.com/dkysrpdi6/image/upload/v1723574586/image_lpepb4.png";
    } else {
      const link = material as LinkProps;
      return (
        link.thumbnailUrl ||
        "https://res.cloudinary.com/dkysrpdi6/image/upload/v1723574586/image_lpepb4.png"
      );
    }
  };

  const getLink = () => {
    if (type === "file") {
      return (material as FileProps).id;
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

  const getFileType = (): string => {
    if (type === "link" || (material as LinkProps).url?.includes(".com")) {
      return "LINK";
    }

    const title = getTitle();
    const parts = title.split(".");
    if (parts.length > 1) {
      return parts.pop()?.toUpperCase() || "FILE";
    }

    return "FILE";
  };

  console.log(material);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (type === "file") {
      e.preventDefault();
      handleNavigation((material as FileProps).id);
    }
  };

  return (
    <a
      href={getLink()}
      onClick={handleClick}
      target={type === "link" ? "_blank" : undefined}
      rel={type === "link" ? "noopener noreferrer" : undefined}
      className="block w-full"
    >
      <div className="group w-full overflow-hidden rounded-lg border-[1px] border-transparent bg-bground2 duration-150 hover:border-[1px] hover:border-zinc-700">
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
              <h1 className="text-sm font-thin text-gray-400">
                {formatDescription(title, 54)}
              </h1>
            </div>
            <div className="flex w-24 items-center justify-start gap-x-2">
              <p className="text-md mt-2 text-gray-500">{getFileType()}</p>
              <IoIosArrowRoundForward className="mt-1 text-xl text-thintext duration-150 group-hover:translate-x-1" />
            </div>
            <div></div>
          </div>
        </div>
      </div>
    </a>
  );
};

export default MaterialCard;
