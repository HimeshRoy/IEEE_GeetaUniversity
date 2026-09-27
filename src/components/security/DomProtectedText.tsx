"use client";

import { useEffect, useRef } from "react";

interface DomProtectedTextProps {
  children: React.ReactNode;
  className?: string;
}

export default function DomProtectedText({
  children,
  className,
}: DomProtectedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const originalText = element.textContent ?? "";
    const originalClass = element.getAttribute("class");

    let restoring = false;

    const restore = () => {
      if (restoring || !element.isConnected) return;

      const textChanged = element.textContent !== originalText;
      const classChanged =
        element.getAttribute("class") !== originalClass;

      if (!textChanged && !classChanged) return;

      restoring = true;

      observer.disconnect();

      element.textContent = originalText;

      if (originalClass !== null) {
        element.setAttribute("class", originalClass);
      } else {
        element.removeAttribute("class");
      }

      observer.observe(element, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
      });

      restoring = false;
    };

    const observer = new MutationObserver(() => {
      restore();
    });

    observer.observe(element, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <span ref={ref} className={className}>
      {children}
    </span>
  );
}