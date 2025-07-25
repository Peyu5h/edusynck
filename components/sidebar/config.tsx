import { GoHome } from "react-icons/go";
import {
  Shapes,
  Users,
  BookOpen,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import {
  MdOutlineAssignment,
  MdOutlineChatBubbleOutline,
  MdOutlineQuiz,
  MdOutlineRecommend,
} from "react-icons/md";

interface NestedNavItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  active: boolean;
  position: "top" | "bottom";
  nested?: NestedNavItem[];
  roles?: string[];
}

export const NavItems = (userRole?: string, pathname: string = "") => {
  function isNavItemActive(nav: string) {
    return pathname === nav || pathname.startsWith(nav);
  }

  const studentNavItems: NavItem[] = [
    {
      name: "Home",
      href: "/",
      icon: <GoHome size={20} />,
      active: isNavItemActive("/"),
      position: "top",
      roles: ["STUDENT"],
    },
    {
      name: "Assignments",
      href: "/assignments",
      icon: <MdOutlineAssignment size={20} />,
      active: isNavItemActive("/assignments"),
      position: "top",
      roles: ["STUDENT"],
    },
    {
      name: "Classrooms",
      href: "/classrooms",
      icon: <Shapes size={20} />,
      active: isNavItemActive("/classrooms"),
      position: "top",
      roles: ["STUDENT"],
    },
    {
      name: "Chats",
      href: "/chats",
      icon: <MdOutlineChatBubbleOutline size={20} />,
      active: isNavItemActive("/chats"),
      position: "top",
      roles: ["STUDENT"],
    },
    {
      name: "Recommendations",
      href: "/recommendations",
      icon: <MdOutlineRecommend size={20} />,
      active: isNavItemActive("/recommendations"),
      position: "top",
      roles: ["STUDENT"],
    },
    {
      name: "Quizzes",
      href: "/quizzes",
      icon: <MdOutlineQuiz size={20} />,
      active: isNavItemActive("/quizzes"),
      position: "top",
      roles: ["STUDENT"],
    },
  ];

  const teacherNavItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/teacher/dashboard",
      icon: <GoHome size={20} />,
      active: isNavItemActive("/teacher/dashboard"),
      position: "top",
      roles: ["CLASS_TEACHER", "ADMIN"],
    },
    {
      name: "Students",
      href: "/teacher/students",
      icon: <Users size={20} />,
      active: isNavItemActive("/teacher/students"),
      position: "top",
      roles: ["CLASS_TEACHER", "ADMIN"],
    },
    {
      name: "Courses",
      href: "/teacher/courses",
      icon: <BookOpen size={20} />,
      active: isNavItemActive("/teacher/courses"),
      position: "top",
      roles: ["CLASS_TEACHER", "ADMIN"],
    },
    {
      name: "Assignments",
      href: "/teacher/assignments",
      icon: <CreditCard size={20} />,
      active: isNavItemActive("/teacher/assignments"),
      position: "top",
      roles: ["CLASS_TEACHER", "ADMIN"],
    },
    {
      name: "Quizzes",
      href: "/teacher/quizzes",
      icon: <BookOpen size={20} />,
      active: isNavItemActive("/teacher/quizzes"),
      position: "top",
      roles: ["CLASS_TEACHER", "ADMIN"],
    },
    {
      name: "Chats",
      href: "/teacher/chats",
      icon: <MessageSquare size={20} />,
      active: isNavItemActive("/teacher/chats"),
      position: "top",
      roles: ["CLASS_TEACHER", "ADMIN"],
    },
  ];

  const allItems = [...studentNavItems, ...teacherNavItems];

  if (userRole) {
    return allItems.filter(
      (item) => !item.roles || item.roles.includes(userRole),
    );
  }

  return allItems;
};
