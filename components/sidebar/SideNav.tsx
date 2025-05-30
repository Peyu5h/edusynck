"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Minus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { NavItems } from "./config";
import { ny } from "~/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Separator } from "@radix-ui/react-select";
import { useAtom } from "jotai";
import { sidebarExpandedAtom } from "~/context/atom";
import { usePathname } from "next/navigation";
import { useCourses } from "~/hooks/useGetCourses";
import SideNavLoader from "../Loaders/SideNavLoader";

export default function SideNav() {
  const pathname = usePathname();
  const [isSidebarExpanded, setIsSidebarExpanded] =
    useAtom(sidebarExpandedAtom);
  const [isClassroomsOpen, setIsClassroomsOpen] = useState(true);
  const [activePath, setActivePath] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!isSidebarExpanded) {
      setIsClassroomsOpen(false);
    }
  }, [isSidebarExpanded]);

  const { data: courses, isLoading, error } = useCourses();

  if (isLoading) return <SideNavLoader />;
  if (error)
    return (
      <div>
        <SideNavLoader />
      </div>
    );

  const navItems = NavItems();

  if (!courses) return null;

  const getFirstCourseId = () =>
    courses && courses.length > 0 ? courses[0].id : "";

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const handleNavItemClick = (path: string) => {
    setActivePath(path);
  };

  // Add this function to check if a path is active
  const isPathActive = (path: string) => {
    return activePath.startsWith(path);
  };

  if (!isClient) {
    return null;
  }

  function formatCourseName(name: string): string {
    return name
      .replace(/TE|SE|FE|BR|CMPN|INFT|ECS|EXTC|-|\d+|%20/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .slice(0, 2)
      .join("-");
  }

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
                <h1 className="font-robson text-5xl text-pri">A</h1>
              )}
            </div>
            <div className="flex flex-col space-y-1">
              {navItems.map((item, idx) => {
                if (item.position === "top") {
                  if (item.name === "Classrooms") {
                    const isAnyClassroomActive = navItems.some(
                      (nav) => nav.active && nav.href.startsWith("/classrooms"),
                    );
                    return (
                      <div key={idx}>
                        <Separator
                          className={ny(
                            "my-2 h-[0.5px] rounded-xl bg-neutral-700",

                            (!isSidebarExpanded || !isClassroomsOpen) &&
                              "hidden",
                          )}
                        />
                        <Collapsible
                          open={isClassroomsOpen}
                          onOpenChange={setIsClassroomsOpen}
                        >
                          <CollapsibleTrigger asChild>
                            <div
                              className={ny(
                                item.active &&
                                  "hover:bg-bground3 dark:hover:bg-bground3",
                                "flex w-full cursor-pointer items-center justify-between rounded-xl text-thintext",
                                !item.active &&
                                  "hover:bg-neutral-200 dark:hover:bg-neutral-800",
                                (item.active || isAnyClassroomActive) &&
                                  "bg-bground3 hover:bg-bground3",
                              )}
                            >
                              <SideNavItem
                                label={item.name}
                                icon={item.icon}
                                path={`/classrooms/${getFirstCourseId()}`}
                                active={item.active || isAnyClassroomActive}
                                isSidebarExpanded={isSidebarExpanded}
                                onClick={() =>
                                  handleNavItemClick(
                                    `/classrooms/${getFirstCourseId()}`,
                                  )
                                }
                              />
                              <ChevronRight
                                size={16}
                                className={ny(
                                  "transition-transform",
                                  isClassroomsOpen && "rotate-90",
                                  !isSidebarExpanded && "hidden",

                                  "absolute right-2",
                                )}
                              />
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="my-4 flex flex-col pl-6">
                              {courses?.map((course: any) => (
                                <SideSubjectitems
                                  key={course.id}
                                  label={formatCourseName(course.name)}
                                  icon={null}
                                  path={`/classrooms/${course.id}`}
                                  active={isPathActive(
                                    `/classrooms/${course.id}`,
                                  )} // Update this line
                                  isSidebarExpanded={true}
                                  isClassroom
                                  onClick={() =>
                                    handleNavItemClick(
                                      `/classrooms/${course.id}`,
                                    )
                                  }
                                />
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                        <Separator
                          className={ny(
                            "my-2 h-[0.5px] rounded-xl bg-neutral-700",

                            (!isSidebarExpanded || !isClassroomsOpen) &&
                              "hidden",
                          )}
                        />
                      </div>
                    );
                  } else {
                    return (
                      <Fragment key={idx}>
                        <div className="space-y-2 text-text">
                          <SideNavItem
                            label={item.name}
                            icon={item.icon}
                            path={item.href}
                            active={activePath === item.href}
                            isSidebarExpanded={isSidebarExpanded}
                            onClick={() => handleNavItemClick(item.href)}
                          />
                        </div>
                      </Fragment>
                    );
                  }
                }
              })}
            </div>
          </div>
          <div className="sticky bottom-0 mb-4 mt-auto block whitespace-nowrap transition duration-200">
            {navItems.map((item, idx) => {
              if (item.position === "bottom") {
                return (
                  <Fragment key={idx}>
                    <div className="space-y-1">
                      <SideNavItem
                        label={item.name}
                        icon={item.icon}
                        path={item.href}
                        active={activePath === item.href}
                        isSidebarExpanded={isSidebarExpanded}
                        onClick={() => handleNavItemClick(item.href)}
                      />
                    </div>
                  </Fragment>
                );
              }
            })}
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
}

export const SideNavItem: React.FC<{
  label: string;
  icon: any;
  path: string;
  active: boolean;
  isSidebarExpanded: boolean;
  onClick?: () => void;
}> = ({ label, icon, path, active, isSidebarExpanded, onClick }) => {
  return (
    <>
      {isSidebarExpanded ? (
        <Link
          href={path}
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
                href={path}
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

export const SideSubjectitems: React.FC<{
  label: string;
  icon: any;
  path: string;
  active: boolean;
  isSidebarExpanded: boolean;
  isClassroom?: boolean;
  onClick?: () => void;
}> = ({ label, icon, path, active, isClassroom, onClick }) => {
  return (
    <>
      <Link
        href={path}
        className={`relative flex h-full items-center whitespace-nowrap rounded-xl py-2 text-lg ${
          active
            ? "font-base text-text shadow-sm"
            : "text-thintext dark:text-neutral-400"
        }`}
        onClick={onClick}
      >
        <div className="font-base relative flex flex-row items-center space-x-2 rounded-md px-2 py-1 text-sm duration-100">
          {icon}
          <Minus
            className={`mb-1 ${isClassroom && active ? "" : "opacity-0"}`}
            size={12}
          />
          <span className="text-sm">{label}</span>
        </div>
      </Link>
    </>
  );
};
