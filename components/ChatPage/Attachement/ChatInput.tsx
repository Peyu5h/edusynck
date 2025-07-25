import React, { useState, useRef } from "react";
import { IoIosSend, IoIosAdd } from "react-icons/io";
import { FaRegSmile } from "react-icons/fa";
import { Button } from "~/components/ui/button";
import AttachmentMenu from "../AttachmentMenu";
import EmojiPickerApp from "../EmojiPicker.jsx";
import AttachmentIcon from "../svg/AttachmentIcon";
import Image from "next/image";

export interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [inputMessage, setInputMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpenAttachment = () => {
    setIsAttachmentOpen(!isAttachmentOpen);
  };

  const handleEmojiClick = (emoji: string) => {
    setInputMessage((prevMessage) => prevMessage + emoji);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() || selectedFiles.length > 0) {
      onSend(inputMessage, selectedFiles);
      setInputMessage("");
      setSelectedFiles([]);
      setIsAttachmentOpen(false);
    }
  };

  // Helper to check if file is image
  function isImage(file: File) {
    return file.type.startsWith("image/");
  }

  // Helper to upload to Cloudinary (replace with your logic)
  async function uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "YOUR_UPLOAD_PRESET"); // Replace with your preset
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/upload",
      {
        method: "POST",
        body: formData,
      },
    );
    const data = await res.json();
    return data.secure_url;
  }

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    // Do NOT send automatically anymore
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    // Optimistically show in chat (call onSend with local preview URLs)
    const previews = selectedFiles.map((file) =>
      isImage(file) ? URL.createObjectURL(file) : file.name,
    );
    onSend("", selectedFiles); // You may want to pass previews for optimistic UI
    // Upload each file
    const uploadedUrls = [];
    for (const file of selectedFiles) {
      try {
        const url = await uploadToCloudinary(file);
        uploadedUrls.push(url);
      } catch (e) {
        uploadedUrls.push(null);
      }
    }
    // Optionally, update chat with real URLs (requires chat logic to support update)
    setSelectedFiles([]);
    setUploading(false);
    setIsAttachmentOpen(false);
  };

  return (
    // Remove the preview area and upload button above the input
    <div className="mt-2 flex w-full justify-center">
      <div className="relative mx-auto flex w-full max-w-4xl items-center">
        <div className="flex w-full items-center rounded-lg border border-border bg-bground2 px-2 py-1 shadow-sm">
          <div
            onClick={handleOpenAttachment}
            className={`flex cursor-pointer items-center justify-center rounded-lg transition-colors duration-200 hover:bg-secondary ${isAttachmentOpen ? "bg-secondary" : ""} mr-1 h-10 w-10`}
          >
            {isAttachmentOpen ? (
              <IoIosAdd className="rotate-45 fill-thintext text-[27px]" />
            ) : (
              <AttachmentIcon className="fill-thintext" />
            )}
          </div>
          {isAttachmentOpen && (
            <AttachmentMenu
              isOpen={isAttachmentOpen}
              setIsOpen={setIsAttachmentOpen}
              onFilesSelected={handleFilesSelected}
            />
          )}
          <div className="flex items-center">
            <EmojiPickerApp
              isopen={isEmojiOpen}
              setisopen={setIsEmojiOpen}
              textRef={inputRef}
              onEmojiClick={handleEmojiClick}
            />
            <div
              onClick={() => setIsEmojiOpen(!isEmojiOpen)}
              className="mr-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg hover:bg-secondary"
            >
              <FaRegSmile className="fill-thintext text-[22px]" />
            </div>
          </div>
          <input
            id="message"
            ref={inputRef}
            className="h-10 flex-1 border-none bg-transparent px-2 font-light outline-none focus:ring-0"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
          />
          <Button
            className="ml-1 flex h-10 w-10 min-w-0 items-center justify-center rounded-lg bg-secondary p-0 text-white hover:bg-orange"
            onClick={handleSendMessage}
            type="button"
          >
            <IoIosSend className="text-xl" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
