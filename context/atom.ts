import { atom } from "jotai";

const getInitialState = (): boolean => {
  if (typeof window !== "undefined") {
    const saved = window.localStorage.getItem("sidebarExpanded");
    if (saved === null) {
      return true;
    }
    return JSON.parse(saved);
  }
  return true;
};

export const sidebarExpandedAtom = atom<boolean>(getInitialState());

export const setSidebarExpandedAtom = atom(
  null,
  (get, set, newValue: boolean) => {
    set(sidebarExpandedAtom, newValue);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("sidebarExpanded", JSON.stringify(newValue));
    }
  },
);
