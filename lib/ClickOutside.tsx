import { useEffect, RefObject, ReactNode } from "react";

interface ClickOutsideProps {
  ref: RefObject<HTMLElement>;
  onClickOutside: () => void;
  children: ReactNode;
}

const ClickOutside: React.FC<ClickOutsideProps> = ({
  ref,
  onClickOutside,
  children,
}) => {
  useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) {
        return;
      }
      onClickOutside();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, onClickOutside]);

  return <>{children}</>;
};

export default ClickOutside;
