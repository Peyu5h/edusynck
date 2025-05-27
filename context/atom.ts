import { atom } from "jotai";

const getInitialState = (): boolean => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("sidebarExpanded");
    return saved !== null ? JSON.parse(saved) : true;
  }
  return true;
};

const baseAtom = atom(getInitialState());

export const sidebarExpandedAtom = atom(
  (get) => get(baseAtom),
  (get, set, newValue: boolean) => {
    set(baseAtom, newValue);
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarExpanded", JSON.stringify(newValue));
    }
  },
);
