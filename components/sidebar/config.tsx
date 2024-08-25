import { usePathname } from "next/navigation";
import { GoHome } from "react-icons/go";
import { TfiAnnouncement } from "react-icons/tfi";

import { Shapes, Settings } from "lucide-react";
import {
  MdOutlineAssignment,
  MdOutlineChatBubbleOutline,
  MdOutlinePoll,
} from "react-icons/md";

export const NavItems = () => {
  const pathname = usePathname();

  function isNavItemActive(nav: string) {
    return pathname === nav || pathname.startsWith(nav);
  }

  return [
    {
      name: "Home",
      href: "/",
      icon: <GoHome size={20} />,
      active: isNavItemActive("/"),
      position: "top",
    },
    {
      name: "Assignments",
      href: "/assignments",
      icon: <MdOutlineAssignment size={20} />,
      active: isNavItemActive("/assignments"),
      position: "top",
    },
    {
      name: "Classrooms",
      href: "/classrooms",
      icon: <Shapes size={20} />,
      active: isNavItemActive("/classrooms"),
      position: "top",
    },
    {
      name: "Chats",
      href: "/chats",
      icon: <MdOutlineChatBubbleOutline size={20} />,
      active: isNavItemActive("/chats"),
      position: "top",
    },

    {
      name: "Settings",
      href: "/settings",
      icon: <Settings size={18} />,
      active: isNavItemActive("/settings"),
      position: "bottom",
    },
  ];
};
