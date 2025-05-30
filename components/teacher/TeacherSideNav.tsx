"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart,
  BookOpen,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ny } from "~/lib/utils";
import { useAtom } from "jotai";
import { sidebarExpandedAtom } from "~/context/atom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  isSidebarExpanded: boolean;
  onClick?: () => void;
}

const NavItem = ({
  href,
  label,
  icon,
  active,
  isSidebarExpanded,
  onClick,
}: NavItemProps) => {
  return (
    <>
      {isSidebarExpanded ? (
        <Link
          href={href}
          className={`relative flex h-full items-center whitespace-nowrap rounded-xl py-2 text-sm ${
            active
              ? "font-base bg-bground3 text-text shadow-sm"
              : `text-thintext hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800`
          }`}
          onClick={onClick}
        >
          <div className="font-base text-md relative flex flex-row items-center space-x-2 rounded-md px-2 py-1.5 duration-100">
            <div className="mb-1">
              <span className="">{icon}</span>
            </div>
            <span className="">{label}</span>
          </div>
        </Link>
      ) : (
        <TooltipProvider delayDuration={70}>
          <Tooltip>
            <TooltipTrigger>
              <Link
                href={href}
                className={`relative mb-1 flex h-full items-center whitespace-nowrap rounded-md ${
                  active
                    ? "font-base bg-bground3 text-text shadow-sm"
                    : "text-thintext hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800"
                }`}
                onClick={onClick}
              >
                <div className="font-base relative flex flex-row items-center space-x-2 rounded-md p-2 text-sm duration-100">
                  {icon}
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              className="px-3 py-1.5 text-xs"
              sideOffset={10}
            >
              <span>{label}</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );
};

const TeacherSideNav = () => {
  const pathname = usePathname();
  const [isSidebarExpanded, setIsSidebarExpanded] =
    useAtom(sidebarExpandedAtom);
  const [activePath, setActivePath] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const handleNavItemClick = (path: string) => {
    setActivePath(path);
  };

  if (!isClient) {
    return null;
  }

  const routes = [
    {
      href: "/teacher/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: pathname === "/teacher/dashboard",
    },
    {
      href: "/teacher/students",
      label: "Students",
      icon: <Users className="h-5 w-5" />,
      active: pathname === "/teacher/students",
    },
    {
      href: "/teacher/courses",
      label: "Courses",
      icon: <BookOpen className="h-5 w-5" />,
      active: pathname === "/teacher/courses",
    },
    {
      href: "/teacher/assignments",
      label: "Assignments",
      icon: <CreditCard className="h-5 w-5" />,
      active: pathname === "/teacher/assignments",
    },
    {
      href: "/teacher/quizzes",
      label: "Quizzes",
      icon: <BookOpen className="h-5 w-5" />,
      active: pathname === "/teacher/quizzes",
    },
    {
      href: "/teacher/chats",
      label: "Chats",
      icon: <MessageSquare className="h-5 w-5" />,
      active: pathname === "/teacher/chats",
    },
    {
      href: "/teacher/settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
      active: pathname === "/teacher/settings",
    },
  ];

  return (
    <div className="pr-4">
      <div
        className={ny(
          isSidebarExpanded ? "w-[270px]" : "w-[68px]",
          "hidden h-[97vh] transform rounded-xl bg-bground2 transition-all duration-300 ease-in-out sm:flex",
        )}
      >
        <aside className="flex h-full w-full columns-1 flex-col overflow-x-hidden break-words px-4">
          <div className="relative mt-4 pb-2">
            <div className="my-4 mb-6 flex items-center justify-center">
              {isSidebarExpanded ? (
                <h1 className="font-robson text-5xl text-pri">EDUSYNC</h1>
              ) : (
                <h1 className="font-robson text-5xl text-pri">E</h1>
              )}
            </div>
            <div className="flex flex-col space-y-1">
              {routes.map((route, idx) => (
                <React.Fragment key={idx}>
                  <div className="space-y-2 text-text">
                    <NavItem
                      href={route.href}
                      label={route.label}
                      icon={route.icon}
                      active={activePath === route.href}
                      isSidebarExpanded={isSidebarExpanded}
                      onClick={() => handleNavItemClick(route.href)}
                    />
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </aside>
        <div className="relative mt-[calc(calc(90vh)-40px)]">
          <button
            type="button"
            className="absolute bottom-32 right-[-12px] flex h-6 w-6 items-center justify-center rounded-full border border-muted-foreground/20 bg-accent shadow-md transition-shadow duration-300 ease-in-out hover:shadow-lg"
            onClick={toggleSidebar}
          >
            {isSidebarExpanded ? (
              <ChevronLeft size={16} className="stroke-foreground" />
            ) : (
              <ChevronRight size={16} className="stroke-foreground" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherSideNav;
