import { useRef } from "react";
import { IoIosDocument, IoMdPhotos } from "react-icons/io";
import { useDispatch } from "react-redux";

const Documents = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  const documentHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    let files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (
        file.type !== "application/pdf" &&
        file.type !== "application/msword" &&
        file.type !==
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
        file.type !== "application/vnd.ms-excel" &&
        file.type !==
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
        file.type !== "application/vnd.ms-powerpoint" &&
        file.type !==
          "application/vnd.openxmlformats-officedocument.presentationml.presentation" &&
        file.type !== "application/zip" &&
        file.type !== "application/x-rar-compressed" &&
        file.type !== "text/plain"
      ) {
        files = files.filter((file) => file !== file);
        return;
      } else if (file.size > 1024 * 1024 * 25) {
        files = files.filter((file) => file !== file);
        return;
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          //dispatch(addFiles)
        };
      }
    });
  };
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple
        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip,application/x-rar-compressed,text/plain"
        onChange={(e) => documentHandler(e)}
      />
      <div
        onClick={() => inputRef.current?.click()}
        className="document flex cursor-pointer items-center gap-x-3 rounded-lg px-3 py-3 hover:bg-bground3"
      >
        <div className="document flex cursor-pointer items-center gap-x-3 rounded-lg hover:bg-bground3">
          <IoIosDocument className="cursor-pointer fill-yellow-500 text-2xl" />
          <p className="">Documents</p>
        </div>
      </div>
    </div>
  );
};

export default Documents;
