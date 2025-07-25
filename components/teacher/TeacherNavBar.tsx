"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { usePathname } from "next/navigation";

const TeacherNavBar = () => {
  const user = useSelector((state: any) => state.user.user);
  const [showNotifications, setShowNotifications] = useState(false);
  const path = usePathname();
  const [greeting, setGreeting] = useState("Good morning");
  const [isAssignment, setIsAssignment] = useState(false);

  useEffect(() => {
    setIsAssignment(path.includes("assignments/"));

    const currentHour = new Date().getHours();
    setGreeting(
      currentHour >= 12 && currentHour < 18
        ? "Good afternoon"
        : currentHour >= 18
          ? "Good evening"
          : "Good morning",
    );
  }, [path]);

  const firstName = user?.name?.split(" ")[0];

  return (
    <div>
      <div className="flex w-full items-center justify-between rounded-xl px-4">
        {isAssignment ? (
          <div className="">
            <h1 className="mt-2 text-3xl font-light text-text">
              Assignment Submissions
            </h1>
            <p className="text-thintext">
              Review and grade student assignments
            </p>
          </div>
        ) : (
          <div className="font-antic text-2xl sm:text-4xl">
            {greeting} <span className="text-pri">{firstName}</span>
          </div>
        )}
        <div>
          <div className="user-btn hidden gap-x-8 md:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                  <div className="px-4 py-2 text-center text-sm text-gray-500">
                    No notifications
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherNavBar;
