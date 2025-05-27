"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart,
  BookOpen,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Users,
} from "lucide-react";
import { ny } from "~/lib/utils";
import { Button } from "~/components/ui/button";

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

const NavItem = ({ href, label, icon, active }: NavItemProps) => {
  return (
    <Link href={href} className="w-full">
      <Button
        variant={active ? "default" : "ghost"}
        className={ny(
          "w-full justify-start gap-2",
          active ? "bg-bground3 text-text" : "hover:bg-muted",
        )}
      >
        {icon}
        <span>{label}</span>
      </Button>
    </Link>
  );
};

const TeacherSideNav = () => {
  const pathname = usePathname();

  const routes = [
    {
      href: "/teacher/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      active: pathname === "/teacher/dashboard",
    },
    {
      href: "/teacher/students",
      label: "Students",
      icon: <Users className="h-4 w-4" />,
      active: pathname === "/teacher/students",
    },
    {
      href: "/teacher/courses",
      label: "Courses",
      icon: <BookOpen className="h-4 w-4" />,
      active: pathname === "/teacher/courses",
    },
    {
      href: "/teacher/assignments",
      label: "Assignments",
      icon: <CreditCard className="h-4 w-4" />,
      active: pathname === "/teacher/assignments",
    },
    {
      href: "/teacher/quizzes",
      label: "Quizzes",
      icon: <BookOpen className="h-4 w-4" />,
      active: pathname === "/teacher/quizzes",
    },
    {
      href: "/teacher/chats",
      label: "Chats",
      icon: <MessageSquare className="h-4 w-4" />,
      active: pathname === "/teacher/chats",
    },
  ];

  return (
    <div className="flex h-full min-w-[260px] flex-col space-y-2 overflow-hidden rounded-r-md bg-bground2 p-3 pb-8 shadow-sm backdrop-blur-md">
      <div className="flex items-center px-3 py-2">
        <h1 className="mx-auto font-robson text-5xl text-pri">EDUSYNC</h1>
      </div>
      <div className="my-2 h-[1px] w-full bg-border" />
      <div className="flex flex-1 flex-col gap-1">
        {routes.map((route) => (
          <NavItem
            key={route.href}
            href={route.href}
            label={route.label}
            icon={route.icon}
            active={route.active}
          />
        ))}
      </div>
    </div>
  );
};

export default TeacherSideNav;
