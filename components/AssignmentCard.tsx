import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import Badge from "./Badge";
import Link from "next/link";

interface AssignmentCardProps {
  assignment: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    materials: {
      driveFile: {
        driveFile: {
          id: string;
          title: string;
          alternateLink: string;
          thumbnailUrl: string;
          extension: string;
          type: string;
        };
        shareMode: string;
      };
    }[];
    type?: string;
    thumbnail?: string;
    alternateLink: string;
  };
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment }) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const material = assignment.materials?.[0]?.driveFile?.driveFile;

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
  const handleDuePriority = (dueDate: string | null | undefined) => {
    if (!dueDate) return "green";

    if (dueDate === null) {
      return "green";
    }

    if (dueDate === "missing") {
      return "red";
    }

    const priority = dueDate.split(" ")[0];
    if (priority === null || undefined) return "green";
    if (parseInt(priority) > 7 && parseInt(priority) < 14) return "orange";
    if (parseInt(priority) <= 7) return "red";
    if (parseInt(priority) >= 14) return "blue";
  };

  const handleDueDate = (dueDate: string | null | undefined) => {
    if (!dueDate) return "No due";

    if (dueDate === null) {
      return "No due";
    }

    if (dueDate === "missing") {
      return "Overdue";
    }

    return dueDate;
  };
  return (
    <div>
      <Link
        href={`/assignments/${assignment.id}`}
        className="flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-lg border-[1px] border-transparent bg-bground2 duration-150 hover:border-[1px] hover:border-zinc-700"
      >
        <div className="left flex gap-x-4">
          <div className="thumbnai w-[6.2rem] overflow-hidden p-2">
            {material?.thumbnailUrl ? (
              <Image
                src={`${backendUrl}/api/admin/image?thumbnailUrl=${material.thumbnailUrl}`}
                alt="thumbnail"
                className="rounded-lg"
                width="99"
                height={99}
                layout="responsive"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-200">
                <Image
                  src={`https://res.cloudinary.com/dkysrpdi6/image/upload/v1723574586/image_lpepb4.png`}
                  alt="thumbnail"
                  className="rounded-lg"
                  width="99"
                  height={99}
                  layout="responsive"
                />
              </div>
            )}
          </div>
          <div className="description flex flex-col py-4">
            <h1 className="text-2xl font-light text-text">
              {assignment.title}
            </h1>
            <p className="text-md font-normal text-thintext">
              {formatDescription(assignment.description, 110)}
            </p>

            <div className="tags mt-2 flex gap-x-2">
              <Badge className="h-8" variant="green" title="Solved" />
              <Badge
                variant="orange"
                title={assignment?.type?.toUpperCase() || "PDF"}
              />
            </div>
          </div>
        </div>
        <div className="deadline px-8">
          <Badge
            variant={handleDuePriority(assignment.dueDate) || "green"}
            title={handleDueDate(assignment.dueDate) || ""}
          />
        </div>
      </Link>
    </div>
  );
};

export default AssignmentCard;
