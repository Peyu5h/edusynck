"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GoHome } from "react-icons/go";
import { Shapes, Settings } from "lucide-react";
import {
  MdOutlineAssignment,
  MdOutlineChatBubbleOutline,
} from "react-icons/md";

const MobileHamburger = () => {
  const [toggleMenu, setToggleMenu] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: <GoHome size={20} /> },
    {
      name: "Assignments",
      href: "/assignments",
      icon: <MdOutlineAssignment size={20} />,
    },
    { name: "Classrooms", href: "/classrooms", icon: <Shapes size={20} /> },
    {
      name: "Chats",
      href: "/chats",
      icon: <MdOutlineChatBubbleOutline size={20} />,
    },
    { name: "Settings", href: "/settings", icon: <Settings size={18} /> },
  ];

  return (
    <div className="md:hidden">
      <div className="absolute right-6 top-9 z-50">
        <button
          onClick={() => setToggleMenu(!toggleMenu)}
          className={`hamburger block focus:outline-none ${toggleMenu ? "open" : ""}`}
          type="button"
        >
          <span className="hamburger-top"></span>
          <span className="hamburger-middle"></span>
          <span className="hamburger-bottom"></span>
        </button>
      </div>

      <div
        className={`fixed inset-0 bg-bground1 transition-transform duration-300 ${
          toggleMenu ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ zIndex: 40 }}
      >
        <nav className="ml-12 flex h-full flex-col items-start justify-center gap-y-8 text-white">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-x-4 text-2xl font-medium ${
                pathname === item.href ? "text-orange" : ""
              }`}
              onClick={() => setToggleMenu(false)}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileHamburger;
