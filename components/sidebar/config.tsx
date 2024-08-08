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

  function isNavItemActive(pathname: string, nav: string) {
    return pathname.includes(nav);
  }

  return [
    {
      name: "Home",
      href: "/",
      icon: <GoHome size={20} />,
      active: pathname === "/",
      position: "top",
    },
    {
      name: "Assignments",
      href: "/assignments",
      icon: <MdOutlineAssignment size={20} />,
      active: isNavItemActive(pathname, "/assignments"),
      position: "top",
    },
    {
      name: "Classrooms",
      href: "/classrooms",
      icon: <Shapes size={20} />,
      active: isNavItemActive(pathname, "/classrooms"),
      position: "top",
    },
    {
      name: "Chats",
      href: "/chats",
      icon: <MdOutlineChatBubbleOutline size={20} />,
      active: isNavItemActive(pathname, "/chats"),
      position: "top",
    },
    {
      name: "Polls",
      href: "/polls",
      icon: <MdOutlinePoll size={20} />,
      active: isNavItemActive(pathname, "/polls"),
      position: "top",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings size={18} />,
      active: isNavItemActive(pathname, "/settings"),
      position: "bottom",
    },
  ];
};
