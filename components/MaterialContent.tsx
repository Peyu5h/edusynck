import React from "react";
import Link from "next/link";
import Image from "next/image";
import Badge from "./Badge";

interface MaterialContentProps {
  material: {
    id: string;
    title: string;
    alternateLink: string;
    files: {
      id: string;
      title: string;
      alternateLink: string;
      thumbnailUrl: string;
      extension: string;
    }[];
    links?: {
      url: string;
      title: string;
      thumbnailUrl: string;
    }[];
  };
}

const MaterialContent: React.FC<MaterialContentProps> = ({ material }) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">
        {material?.title || "Untitled Material"}
      </h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {material?.files && material.files.length > 0 ? (
          material.files.map((file) => (
            <div key={file.id} className="rounded-lg border p-4">
              <Image
                src={`${backendUrl}/api/admin/image?thumbnailUrl=${file.thumbnailUrl}`}
                alt={file.title}
                width={200}
                height={200}
                className="mb-2 rounded-lg"
              />
              <h2 className="text-lg font-semibold">{file.title}</h2>
              <p>{file.title}</p>
              <a
                href={file.alternateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View File
              </a>
            </div>
          ))
        ) : (
          <p>No files available for this material.</p>
        )}
        {material.links && material.links.length > 0 ? (
          material.links.map((link, index) => (
            <div key={index} className="rounded-lg border p-4">
              <Image
                src={link.thumbnailUrl}
                alt={link.title}
                width={100}
                height={100}
                layout="responsive"
              />
              <h2 className="mt-2 text-xl">{link.title}</h2>
              <Badge variant="green" title="Link" />
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 mt-2 inline-block"
              >
                Open Link
              </a>
            </div>
          ))
        ) : (
          <p>No links available for this material.</p>
        )}
      </div>
    </div>
  );
};

export default MaterialContent;
