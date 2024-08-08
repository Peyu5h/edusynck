"use client";

import React from "react";
import Image from "next/image";

interface UserAvatarProps {
  avatarUrl: string | null | undefined;
  size?: number;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  size,
  className,
}) => {
  return (
    <Image
      src={
        avatarUrl ||
        "https://res.cloudinary.com/dkd5jblv5/image/upload/v1675976806/Default_ProfilePicture_gjngnb.png"
      }
      alt="User avatar"
      width={size ?? 48}
      height={size ?? 48}
      className={className}
    />
  );
};

export default UserAvatar;
