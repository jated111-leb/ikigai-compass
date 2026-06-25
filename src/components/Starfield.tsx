import { useEffect, useRef } from "react";

/**
 * Living starfield: three parallax layers that drift slowly on their own
 * and shift further as the user scrolls, creating depth.
 */
export const Starfield = () => {
  const farRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const nearRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (farRef.current) farRef.current.style.transform = `translate3d(0, ${y * -0.05}px, 0)`;
        if (midRef.current) midRef.current.style.transform = `translate3d(0, ${y * -0.15}px, 0)`;
        if (nearRef.current) nearRef.current.style.transform = `translate3d(0, ${y * -0.3}px, 0)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div ref={farRef} className="starfield-layer starfield-far" />
      <div ref={midRef} className="starfield-layer starfield-mid" />
      <div ref={nearRef} className="starfield-layer starfield-near" />
      {/* warm aurora wash to keep the night candlelit */}
      <div className="absolute inset-0 starfield-aurora" />
    </div>
  );
};

export default Starfield;
