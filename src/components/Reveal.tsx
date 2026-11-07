import { useEffect, useRef, useState, type ReactNode } from "react";
export function Reveal({
  children,
  className = "",
  immediate = false,
}: {
  children: ReactNode;
  className?: string;
  immediate?: boolean;
}) {
  const element = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(immediate);
  useEffect(() => {
    if (immediate || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    if (element.current) observer.observe(element.current);
    return () => observer.disconnect();
  }, [immediate]);
  return (
    <div
      ref={element}
      className={`reveal-block${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}
