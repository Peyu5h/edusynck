import React from "react";
import moment from "moment";
import SeenIcon from "./svg/SeenIcon";
import { HiDownload } from "react-icons/hi";
import useDownloader from "react-use-downloader";
import { saveAs } from "file-saver";

import {
  FaFileAlt,
  FaImage,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaDownload,
} from "react-icons/fa";
import Image from "next/image";

interface FileAttachment {
  url: string;
  type: string;
  name: string;
  size: number;
}

interface Message {
  id: string;
  sender?: { id: string; name: string };
  content: string;
  createdAt: string;
  files?: FileAttachment[];
}

interface MessagesProps {
  messages: Message[];
  currentUserId: string;
}

const Messages: React.FC<MessagesProps> = ({ messages, currentUserId }) => {
  const getFileIcon = (type: string) => {
    if (type.startsWith("image")) return <FaImage />;
    if (type.includes("pdf")) return <FaFilePdf />;
    if (type.includes("word")) return <FaFileWord />;
    if (type.includes("excel") || type.includes("spreadsheet"))
      return <FaFileExcel />;
    return <FaFileAlt />;
  };

  const getPreviewImg = (type: string) => {
    if (type == "PDF") {
      return "https://res.cloudinary.com/dkysrpdi6/image/upload/v1712924091/PDF_i6w2tv.png";
    }

    if (type == "DOCX") {
      return "https://res.cloudinary.com/dkysrpdi6/image/upload/v1712778291/DoNotDelete/xxxxx---DOCX_tg7efe.png";
    }
    if (type == "PPTX") {
      return "https://res.cloudinary.com/dkysrpdi6/image/upload/v1712778292/DoNotDelete/xxxxx---PPTX_ede7hj.png";
    }
    if (type == "XLSX") {
      return "https://res.cloudinary.com/dkysrpdi6/image/upload/v1712778296/DoNotDelete/xxxxx---XLSX_ikqmtt.png";
    }
    if (type == "RAR") {
      return "https://res.cloudinary.com/dkysrpdi6/image/upload/v1712778298/DoNotDelete/xxxxx---ZIP_vobuiq.png";
    }
    if (type == "ZIP") {
      return "https://res.cloudinary.com/dkysrpdi6/image/upload/v1712778298/DoNotDelete/xxxxx---ZIP_vobuiq.png";
    }
    if (type == "AUDIO") {
      return "https://res.cloudinary.com/dkysrpdi6/image/upload/v1712778299/DoNotDelete/xxxxx---AUDIO_c1wfrp.png";
    }
    if (type == "VIDEO") {
      return "https://res.cloudinary.com/dkysrpdi6/image/upload/v1712778297/DoNotDelete/xxxxx---VIDEO_g9dnwm.png";
    }
    if (type == "TXT") {
      return "https://res.cloudinary.com/dkysrpdi6/image/upload/v1712778294/DoNotDelete/xxxxx---TXT_uhobij.png";
    }

    return "https://res.cloudinary.com/dkysrpdi6/image/upload/v1712778295/DoNotDelete/xxxxx---UK_u9khku.png";
  };

  const getFileType = (memType: string) => {
    switch (memType) {
      case "text/plain":
        return "TXT";
      case "application/pdf":
        return "PDF";
      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return "DOCX";
      case "application/vnd.ms-powerpoint":
      case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        return "PPTX";
      case "application/vnd.ms-excel":
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        return "XLSX ";
      case "application/vnd.rar":
        return "RAR";
      case "application/zip":
        return "ZIP";
      case "audio/mpeg":
      case "audio/wav":
        return "AUDIO";
      case "video/mp4":
      case "video/mpeg":
        return "VIDEO";
      default:
        return "image";
    }
  };

  const { download } = useDownloader();

  const handleDownload = (url: string, filename: string) => {
    saveAs(url, filename);
  };

  return (
    <div className="flex flex-col space-y-4">
      {messages.map((message) => {
        const isCurrentUser = message.sender?.id === currentUserId;

        return (
          <div
            key={message.id}
            className={`relative flex items-start ${isCurrentUser ? "justify-end" : "justify-start"}`}
          >
            {!isCurrentUser && message.sender && (
              <div className="mr-2 flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange">
                  <span className="text-sm font-semibold">
                    {message.sender.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            )}
            <div
              className={`max-w-[70%] ${
                isCurrentUser
                  ? "rounded-l-lg rounded-br-lg"
                  : "rounded-r-lg rounded-bl-lg"
              } px-3 pt-3 ${
                isCurrentUser
                  ? "bg-blue text-white"
                  : "bg-secondary text-foreground"
              }`}
            >
              <div
                className={`absolute top-[0px] h-4 w-3 ${
                  isCurrentUser ? "triangle-right right-[-11px] bg-blue" : null
                } `}
              ></div>
              {!isCurrentUser && message.sender && (
                <p className="mb-1 text-xs font-bold">{message.sender.name}</p>
              )}
              <p>{message.content}</p>
              <p className="mb-1 flex items-center justify-end text-right text-[10px] opacity-50">
                <div className="mt-1">
                  {moment(message.createdAt).format("h:mm A")}
                </div>
                <div className="ml-1 flex items-center justify-center">
                  {isCurrentUser && (
                    <SeenIcon className="fill-teal-200 text-[10px]" />
                  )}
                </div>
              </p>
              {message.files && message.files.length > 0 && (
                <div className="mb-4 mt-2 flex flex-wrap gap-2">
                  {message.files.map((file, index) => (
                    <div key={index} className="flex flex-col items-center">
                      {file.type.startsWith("image") ? (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Image
                            src={file.url}
                            alt={file.name}
                            width={100}
                            height={100}
                            layout="responsive"
                            className="h-20 max-w-[300px] rounded-lg"
                          />
                        </a>
                      ) : (
                        <div className="mb-2 flex h-20 w-[300px] items-center justify-between rounded-lg bg-black bg-opacity-25 p-4">
                          <div className="flex gap-x-2">
                            <img
                              src={getPreviewImg(getFileType(file.type))}
                              className="h-10 w-10"
                              alt=""
                            />

                            <div className="description">
                              <h1 className="text-dark_text_1 text-sm">
                                {file.name}
                              </h1>
                              <h1 className="text-dark_text_2 text-xs">
                                {file.size
                                  ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                                  : "0.4 MB"}{" "}
                                - {getFileType(file.type)}
                              </h1>
                            </div>
                          </div>

                          {/* download Button */}
                          <div
                            onClick={() => handleDownload(file.url, file.name)}
                            className="cursor-pointer rounded-full border-2 border-thintext p-2"
                          >
                            <HiDownload className="text-dark_svg_1 text-xl" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
