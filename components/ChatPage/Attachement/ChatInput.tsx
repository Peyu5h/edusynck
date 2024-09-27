import React, { useState, useRef } from "react";
import { IoIosSend, IoIosAdd } from "react-icons/io";
import { FaRegSmile } from "react-icons/fa";
import { Button } from "~/components/ui/button";
import AttachmentMenu from "../AttachmentMenu";
import EmojiPickerApp from "../EmojiPicker.jsx";
import AttachmentIcon from "../svg/AttachmentIcon";

export interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [inputMessage, setInputMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
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

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    // Automatically send the message if files are selected
    if (files.length > 0) {
      onSend("", files);
      setSelectedFiles([]);
      setIsAttachmentOpen(false);
    }
  };

  return (
    <div className="mt-2 flex w-full justify-center space-x-3">
      <div className="relative mx-auto flex w-full max-w-4xl items-center space-x-2">
        {isAttachmentOpen && (
          <AttachmentMenu
            isOpen={isAttachmentOpen}
            setIsOpen={setIsAttachmentOpen}
            onFilesSelected={handleFilesSelected}
          />
        )}
        <div
          onClick={handleOpenAttachment}
          className={`relative hover:bg-secondary ${
            isAttachmentOpen ? "bg-secondary p-2 duration-200" : "p-2.5"
          } cursor-pointer rounded-full duration-200`}
        >
          {isAttachmentOpen ? (
            <IoIosAdd className="rotate-45 cursor-pointer fill-thintext text-[27px]" />
          ) : (
            <AttachmentIcon className="cursor-pointer fill-thintext" />
          )}
        </div>
        <EmojiPickerApp
          isopen={isEmojiOpen}
          setisopen={setIsEmojiOpen}
          textRef={inputRef}
          onEmojiClick={handleEmojiClick}
        />
        <div
          onClick={() => setIsEmojiOpen(!isEmojiOpen)}
          className="cursor-pointer rounded-full p-2.5 hover:bg-secondary"
        >
          <FaRegSmile className="fill-thintext text-[22px]" />
        </div>

        <input
          id="message"
          ref={inputRef}
          className="h-12 w-full rounded-md bg-bground2 p-1 px-4 font-light outline-none"
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
          className="h-12 rounded-full bg-secondary text-white hover:bg-orange"
          onClick={handleSendMessage}
        >
          <IoIosSend />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
