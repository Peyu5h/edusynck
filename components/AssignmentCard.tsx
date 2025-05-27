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
      files: {
        id: string;
        title: string;
        alternateLink: string;
        thumbnailUrl: string;
        extension: string;
        type: string;
      }[];
    };
    type?: string;
    thumbnail?: string;
    alternateLink: string;
    courseName: string; // Add this line
  };
}

function formatCourseName(name: string): string {
  return name
    .replace(/TE|SE|FE|BR|CMPN|INFT|ECS|EXTC|-|\d+|%20/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 2)
    .join("-");
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment }) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  console.log(assignment);
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
  const material = assignment?.materials?.files[0];
  if (!material) {
    return null;
  }
  return (
    <div className="w-full">
      <Link
        href={{
          pathname: `/assignments/${material.id}`,
        }}
        className="flex h-[180px] w-full cursor-pointer items-center justify-between overflow-hidden rounded-lg border-[1px] border-transparent bg-bground2 duration-150 hover:border-[1px] hover:border-zinc-700"
      >
        <div className="left flex h-full gap-x-4">
          <div className="thumbnail hidden h-full w-[140px] overflow-hidden p-2 sm:block">
            <div className="relative h-full w-full rounded-lg bg-white">
              {material?.thumbnailUrl ? (
                <Image
                  src={`${backendUrl}/api/admin/image?thumbnailUrl=${material.thumbnailUrl}`}
                  alt="thumbnail"
                  className="rounded-lg object-cover"
                  fill
                  sizes="180px"
                />
              ) : (
                <Image
                  src={`https://res.cloudinary.com/dkysrpdi6/image/upload/v1723574586/image_lpepb4.png`}
                  alt="thumbnail"
                  className="rounded-lg object-cover"
                  fill
                  sizes="180px"
                />
              )}
            </div>
          </div>
          <div className="description flex flex-col justify-between py-4 pl-4 pr-4 sm:pl-0">
            <div>
              <h1 className="line-clamp-1 text-2xl font-light text-text">
                {assignment.title}
              </h1>
              <p className="text-md line-clamp-2 font-normal text-thintext">
                {formatDescription(assignment.description, 90)}
              </p>
            </div>
            <div className="tags mt-2 flex gap-x-2">
              <Badge
                className="h-8"
                variant="orange"
                title={formatCourseName(assignment.courseName)}
              />
              <Badge
                variant="blue"
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
