import React, { useState, useRef, useEffect } from "react";
import { FaCamera, FaFileAlt, FaImage, FaTimesCircle } from "react-icons/fa";
import { IoIosAdd } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";

interface FilePreview {
  file: File;
  preview: string;
  type: string;
}

interface AttachmentMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onFilesSelected: (files: File[]) => void; // Add this line
}

const AttachmentMenu: React.FC<AttachmentMenuProps> = ({
  isOpen,
  setIsOpen,
  onFilesSelected, // Add this line
}) => {
  const el = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);

  const cloudinarySecret = process.env.NEXT_PUBLIC_CLOUDINARY_SECRET;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (el.current && !el.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: FilePreview[] = [];

    files.forEach((file) => {
      if (file.size > 1024 * 1024 * 25) {
        alert(`File ${file.name} is too large. Maximum size is 25MB.`);
        return;
      }

      const fileType = file.type.split("/")[0];
      const preview = fileType === "image" ? URL.createObjectURL(file) : "";

      newFiles.push({ file, preview, type: fileType });
    });

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    onFilesSelected(files); // Add this line to pass selected files to parent
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    for (const filePreview of selectedFiles) {
      try {
        const formData = new FormData();
        formData.append("upload_preset", cloudinarySecret || "");
        formData.append("file", filePreview.file);

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dkysrpdi6/auto/upload",
          {
            method: "POST",
            body: formData,
          },
        );

        const data = await response.json();
        console.log("Uploaded file URL:", data.secure_url);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    setSelectedFiles([]);
    setIsOpen(false);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <FaImage className="text-blue-500" />;
      case "video":
        return <FaCamera className="text-green-500" />;
      default:
        return <FaFileAlt className="text-yellow-500" />;
    }
  };

  const formatName = (
    name: string | undefined | null,
    maxLength = 20,
  ): string => {
    if (!name) {
      return "";
    }

    const truncated =
      name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;

    return `${truncated}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-full left-0 mb-2 w-72"
        >
          <div ref={el} className="rounded-lg bg-bground2 p-4 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Attachment</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-thintext hover:text-text"
              >
                <IoIosAdd className="rotate-45 text-2xl" />
              </button>
            </div>
            <div className="mb-4 grid grid-cols-3 gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-lg bg-bground3 p-2 hover:bg-zinc-900"
              >
                <FaImage className="mb-1 text-2xl text-blue" />
                <div className="text-xs">Photo</div>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-lg bg-bground3 p-2 hover:bg-zinc-900"
              >
                <FaCamera className="mb-1 text-2xl text-green" />
                <span className="text-xs">Video</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-lg bg-bground3 p-2 hover:bg-zinc-900"
              >
                <FaFileAlt className="mb-1 text-2xl text-yellow-500" />
                <span className="text-xs">Document</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              multiple
              accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip,application/x-rar-compressed,text/plain"
              onChange={handleFileInputChange}
            />
            {selectedFiles.length > 0 && (
              <div className="scrollbar mb-4 max-h-40 overflow-y-auto pr-1">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="scrollbar mb-2 flex items-center justify-between rounded-lg bg-bground3 p-2"
                  >
                    <div className="flex items-center">
                      {file.type === "image" ? (
                        <img
                          src={file.preview}
                          alt="preview"
                          className="mr-2 h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="mr-2 flex h-10 w-10 items-center justify-center text-2xl">
                          {getFileIcon(file.type)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {formatName(file.file.name)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTimesCircle />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={uploadFiles}
              disabled={selectedFiles.length === 0}
              className="hover:bg-blue-600 w-full rounded-lg bg-pri py-2 font-bold text-white disabled:cursor-not-allowed disabled:bg-zinc-800"
            >
              Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AttachmentMenu;
