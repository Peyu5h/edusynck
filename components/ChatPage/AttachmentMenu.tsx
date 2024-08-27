import { FaCamera } from "react-icons/fa";
import { IoPerson } from "react-icons/io5";
import { useRef, useEffect } from "react";
import PhotoVideos from "./Attachement/PhotoVideos";
import Documents from "./Attachement/Documents";

const AttachmentMenu = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (el.current && !el.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);
  return (
    <div className="absolute bottom-full left-0 mb-2">
      <div ref={el} className="openAnimation rounded-lg bg-bground2 p-3">
        <div className="document flex cursor-pointer items-center gap-x-3 rounded-lg px-3 py-3 hover:bg-bground3">
          <FaCamera className="cursor-pointer fill-rose-600 text-xl" />
          <p className="">Camera</p>
        </div>

        <PhotoVideos />

        <Documents />
      </div>
    </div>
  );
};

export default AttachmentMenu;
