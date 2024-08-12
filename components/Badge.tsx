import React from "react";
import { Button } from "./ui/button";
import { ny } from "~/lib/utils";

const colorVariants = {
  green: "bg-greenBg text-green hover:bg-greenBg",
  red: "bg-redBg text-red hover:bg-redBg",
  blue: "bg-blueBg text-blue hover:bg-blueBg",
  orange: "bg-orangeBg text-orange hover:bg-orangeBg",
};

const Badge = ({
  variant,
  title,
  className,
}: {
  variant: keyof typeof colorVariants;
  title: string;
  className?: string;
}) => {
  return (
    <div>
      <Button
        className={ny(
          `${colorVariants[variant]} h-8 cursor-default rounded-lg pb-1`,
          className,
        )}
      >
        {title}
      </Button>
    </div>
  );
};

export default Badge;
