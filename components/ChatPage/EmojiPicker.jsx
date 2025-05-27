import React, { useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";

const EmojiPickerApp = ({ isopen, setisopen, textRef, onEmojiClick }) => {
  const el = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (el.current && !el.current.contains(event.target)) {
        setisopen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setisopen]);

  const handleEmojiClick = (emojiObject) => {
    onEmojiClick(emojiObject.emoji);
  };

  return (
    <div className="absolute left-0 top-0">
      <div
        ref={el}
        className={`openAnimation absolute bottom-0 left-24 ${
          isopen ? "block" : "hidden"
        }`}
      >
        <EmojiPicker theme="dark" onEmojiClick={handleEmojiClick} />
      </div>
    </div>
  );
};

export default EmojiPickerApp;
