import { motion } from "framer-motion";

const NODES = [
  { x: 80, y: 90, label: "I" },
  { x: 180, y: 50, label: "II" },
  { x: 280, y: 120, label: "III" },
  { x: 380, y: 70, label: "IV" },
  { x: 460, y: 150, label: "V" },
  { x: 540, y: 90, label: "VI" },
];

interface Props { title?: string }

export function ConstellationHero({ title = "My Ikigai Constellation" }: Props) {
  const path = NODES.map((n, i) => `${i === 0 ? "M" : "L"} ${n.x} ${n.y}`).join(" ");
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-accent/20 bg-background/50 p-6 mb-10">
      <div className="absolute inset-0 opacity-50"
        style={{ background: "radial-gradient(ellipse at center, hsl(38 92% 58% / 0.15), transparent 70%)" }} />
      <svg viewBox="0 0 620 220" className="w-full h-auto relative">
        <motion.path
          d={path} fill="none" stroke="hsl(38 92% 58%)" strokeWidth="1" opacity="0.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
        {NODES.map((n, i) => (
          <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.25 }}>
            <circle cx={n.x} cy={n.y} r="8" fill="hsl(38 92% 58%)" opacity="0.2" />
            <circle cx={n.x} cy={n.y} r="3.5" fill="hsl(45 100% 85%)" />
            <text x={n.x} y={n.y - 14} textAnchor="middle" fontSize="9"
              fill="hsl(38 80% 80%)" fontFamily="Playfair Display, serif" letterSpacing="1">{n.label}</text>
          </motion.g>
        ))}
      </svg>
      <p className="text-center text-xs uppercase tracking-[0.3em] text-accent/70 mt-2">{title}</p>
    </div>
  );
}
