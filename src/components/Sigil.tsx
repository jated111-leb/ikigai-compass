import { motion } from "framer-motion";

// One sigil per module — geometric seal. Color tuned to the module aura.
const MODULE_HUE: Record<number, number> = { 1: 30, 2: 270, 3: 0, 4: 150, 5: 210, 6: 45 };

interface SigilProps {
  moduleId: number;
  size?: number;
  animate?: boolean;
  glow?: boolean;
}

export function Sigil({ moduleId, size = 96, animate = false, glow = false }: SigilProps) {
  const hue = MODULE_HUE[moduleId] ?? 38;
  const stroke = `hsl(${hue}, 80%, 65%)`;
  const fill = `hsl(${hue}, 80%, 70%)`;

  // Per-module unique inner glyph
  const glyphs: Record<number, JSX.Element> = {
    1: <path d="M50 30 C 35 30, 25 45, 35 60 L 50 75 L 65 60 C 75 45, 65 30, 50 30 Z" />,
    2: <path d="M30 60 L 50 30 L 70 60 M 40 60 L 60 60" />,
    3: <circle cx="50" cy="50" r="14" />,
    4: <path d="M30 50 Q 50 25 70 50 Q 50 75 30 50 Z" />,
    5: <path d="M50 28 L 58 46 L 78 48 L 62 60 L 68 80 L 50 68 L 32 80 L 38 60 L 22 48 L 42 46 Z" />,
    6: <g><circle cx="50" cy="50" r="6" /><path d="M50 28 L 50 42 M50 58 L 50 72 M28 50 L 42 50 M58 50 L 72 50 M35 35 L 43 43 M57 57 L 65 65 M65 35 L 57 43 M43 57 L 35 65" /></g>,
  };

  const ringInitial = animate ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 };
  const ringAnimate = { pathLength: 1, opacity: 1 };

  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 100 100"
      style={{ filter: glow ? `drop-shadow(0 0 12px hsla(${hue},80%,60%,0.5))` : undefined }}
      initial={animate ? { scale: 0.6, opacity: 0, rotate: -90 } : false}
      animate={animate ? { scale: 1, opacity: 1, rotate: 0 } : undefined}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <defs>
        <radialGradient id={`sg-${moduleId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={fill} stopOpacity="0.25" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill={`url(#sg-${moduleId})`} />
      <motion.circle cx="50" cy="50" r="44" fill="none" stroke={stroke} strokeWidth="1" opacity="0.6"
        initial={ringInitial} animate={ringAnimate} transition={{ duration: 1.4 }} />
      <motion.circle cx="50" cy="50" r="36" fill="none" stroke={stroke} strokeWidth="0.7" opacity="0.4"
        initial={ringInitial} animate={ringAnimate} transition={{ duration: 1.4, delay: 0.2 }} />
      {/* 6-point compass marks */}
      {[0, 60, 120, 180, 240, 300].map(a => {
        const rad = (a * Math.PI) / 180;
        const x1 = 50 + Math.cos(rad) * 36, y1 = 50 + Math.sin(rad) * 36;
        const x2 = 50 + Math.cos(rad) * 44, y2 = 50 + Math.sin(rad) * 44;
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth="1" opacity="0.7" />;
      })}
      <motion.g
        stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"
        initial={animate ? { opacity: 0, scale: 0.7 } : false}
        animate={animate ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        {glyphs[moduleId]}
      </motion.g>
    </motion.svg>
  );
}
