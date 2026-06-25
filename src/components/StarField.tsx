import { useEffect, useRef, useState } from "react";

type Star = { x: number; y: number; r: number; o: number; depth: number };
type Shoot = { id: number; x: number; y: number; angle: number; born: number };

// Trigger a shooting star from anywhere: window.dispatchEvent(new CustomEvent('ikigai:shootingstar'))
export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shoots, setShoots] = useState<Shoot[]>([]);
  const scrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => { scrollY.current = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: Star[] = [];
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);
      const count = Math.floor((window.innerWidth * window.innerHeight) / 9000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 1.4,
        r: Math.random() * 1.2 + 0.2,
        o: Math.random() * 0.6 + 0.2,
        depth: Math.random() * 0.7 + 0.15,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    let activeShoots: { x: number; y: number; vx: number; vy: number; life: number; born: number }[] = [];

    const onShoot = () => {
      const startX = Math.random() * window.innerWidth * 0.6;
      const startY = Math.random() * window.innerHeight * 0.3;
      const angle = Math.PI / 6 + (Math.random() * 0.3 - 0.15);
      const speed = 14;
      activeShoots.push({
        x: startX, y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1, born: performance.now(),
      });
    };
    window.addEventListener("ikigai:shootingstar", onShoot);

    // rare ambient shooting star (~once / 25s)
    const ambient = setInterval(() => { if (Math.random() < 0.4) onShoot(); }, 25000);

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const parallax = scrollY.current;
      const t = performance.now() / 1000;

      for (const s of stars) {
        const y = s.y - parallax * s.depth * 0.4;
        const wrapped = ((y % (window.innerHeight + 100)) + (window.innerHeight + 100)) % (window.innerHeight + 100) - 50;
        const twinkle = 0.6 + Math.sin(t * 1.5 + s.x * 0.05) * 0.4;
        ctx.beginPath();
        ctx.arc(s.x, wrapped, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(38, 60%, 85%, ${s.o * twinkle})`;
        ctx.fill();
      }

      activeShoots = activeShoots.filter(sh => sh.life > 0);
      for (const sh of activeShoots) {
        sh.x += sh.vx; sh.y += sh.vy; sh.life -= 0.012;
        const grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * 10, sh.y - sh.vy * 10);
        grad.addColorStop(0, `hsla(38, 100%, 85%, ${sh.life})`);
        grad.addColorStop(1, "hsla(38, 100%, 85%, 0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(sh.x - sh.vx * 10, sh.y - sh.vy * 10);
        ctx.stroke();
        // bright head
        ctx.beginPath();
        ctx.arc(sh.x, sh.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(45, 100%, 92%, ${sh.life})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("ikigai:shootingstar", onShoot);
      clearInterval(ambient);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 pointer-events-none z-0 opacity-90"
    />
  );
}
