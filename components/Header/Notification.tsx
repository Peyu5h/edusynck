"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Check, LogOutIcon, Monitor, Moon, Sun, UserIcon } from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { IoMdNotifications } from "react-icons/io";

const Notification = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-12 w-12 items-center justify-center rounded-full border-none bg-bground2 text-3xl text-svg outline-none hover:bg-bground3">
          <IoMdNotifications />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>4+ new messages</DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => console.log("hello")}>
          Pranali just uploaded assignment
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => console.log("hello")}>
          Shailey just uploaded material
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notification;
