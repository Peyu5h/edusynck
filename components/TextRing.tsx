import React from "react";

interface TextRingProps {
  text: string;
  isPaused?: boolean;
}

const TextRing: React.FC<TextRingProps> = ({ text, isPaused = false }) => {
  const chars = text.split("");
  const innerAngle = 360 / chars.length;
  const radius = 1 / Math.sin((innerAngle / 180) * Math.PI);

  return (
    <span
      className={`text-ring ${isPaused ? "paused" : ""}`}
      style={
        {
          "--total": chars.length,
          "--radius": `${radius}ch`,
        } as React.CSSProperties
      }
    >
      <span>
        {chars.map((char, index) => (
          <span key={index} style={{ "--index": index } as React.CSSProperties}>
            {char}
          </span>
        ))}
      </span>
    </span>
  );
};

export default TextRing;
