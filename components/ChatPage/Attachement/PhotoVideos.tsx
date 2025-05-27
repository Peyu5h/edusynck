import { useRef } from "react";
import { IoMdPhotos } from "react-icons/io";
import { useDispatch } from "react-redux";

const PhotoVideos = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  const imageHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    let files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (
        file.type !== "image/jpeg" &&
        file.type !== "image/png" &&
        file.type !== "image/jpg" &&
        file.type !== "image/gif" &&
        file.type !== "video/mp4" &&
        file.type !== "video/mpeg" &&
        file.type !== "video/avi" &&
        file.type !== "image/webp"
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
          //dispatch(addMessage)
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
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,video/mp4,video/mpeg,video/avi"
        onChange={(e) => imageHandle(e)}
      />
      <div
        onClick={() => inputRef.current?.click()}
        className="document flex cursor-pointer items-center gap-x-3 rounded-lg px-3 py-3 hover:bg-bground3"
      >
        <div className="document flex cursor-pointer items-center gap-x-3 rounded-lg hover:bg-bground3">
          <IoMdPhotos className="cursor-pointer fill-teal-500 text-2xl" />
          <p className="">Photos & Videos</p>
        </div>
      </div>
    </div>
  );
};

export default PhotoVideos;
