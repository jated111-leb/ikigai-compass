import { useEffect } from "react";

// Updates --cx / --cy CSS vars on .cursor-glow elements relative to themselves.
export function useCursorGlow() {
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const targets = document.querySelectorAll<HTMLElement>(".cursor-glow");
      targets.forEach(el => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (x >= -40 && y >= -40 && x <= rect.width + 40 && y <= rect.height + 40) {
          el.style.setProperty("--cx", `${x}px`);
          el.style.setProperty("--cy", `${y}px`);
          el.style.setProperty("--cg", "1");
        } else {
          el.style.setProperty("--cg", "0");
        }
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
}
