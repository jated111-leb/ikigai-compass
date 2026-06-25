import { motion } from "framer-motion";

interface Props { statement: string }

export function CompassArtifact({ statement }: Props) {
  return (
    <div className="relative py-8">
      <div className="relative mx-auto" style={{ width: 320, height: 320 }}>
        {/* Outer halo */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(38 92% 58% / 0.25), transparent 60%)",
            filter: "blur(20px)",
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.svg
          viewBox="0 0 200 200" className="absolute inset-0 w-full h-full"
          initial={{ rotate: -180, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        >
          <defs>
            <radialGradient id="compass-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(38 60% 20%)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(38 60% 20%)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="95" fill="url(#compass-bg)" />
          <circle cx="100" cy="100" r="92" fill="none" stroke="hsl(38 92% 58%)" strokeWidth="0.5" opacity="0.6" />
          <circle cx="100" cy="100" r="78" fill="none" stroke="hsl(38 92% 58%)" strokeWidth="0.5" opacity="0.4" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="hsl(38 92% 58%)" strokeWidth="0.3" opacity="0.3" />
          {/* tick marks */}
          {Array.from({ length: 60 }).map((_, i) => {
            const a = (i * 6 * Math.PI) / 180;
            const r1 = i % 5 === 0 ? 78 : 84;
            const r2 = 92;
            return (
              <line key={i}
                x1={100 + Math.cos(a) * r1} y1={100 + Math.sin(a) * r1}
                x2={100 + Math.cos(a) * r2} y2={100 + Math.sin(a) * r2}
                stroke="hsl(38 80% 75%)" strokeWidth={i % 5 === 0 ? 1 : 0.4} opacity="0.7"
              />
            );
          })}
          {/* Cardinal letters */}
          {[
            { l: "N", x: 100, y: 22 }, { l: "E", x: 178, y: 104 },
            { l: "S", x: 100, y: 186 }, { l: "W", x: 22, y: 104 },
          ].map(c => (
            <text key={c.l} x={c.x} y={c.y} textAnchor="middle" fontSize="9"
              fill="hsl(38 80% 80%)" fontFamily="Playfair Display, serif">{c.l}</text>
          ))}
          {/* Rose */}
          <motion.g
            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.6 }}
            style={{ transformOrigin: "100px 100px" }}
          >
            <polygon points="100,30 108,100 100,170 92,100" fill="hsl(38 92% 58%)" opacity="0.85" />
            <polygon points="30,100 100,108 170,100 100,92" fill="hsl(38 60% 45%)" opacity="0.7" />
            <polygon points="50,50 100,100 150,150 100,100" fill="none" stroke="hsl(38 80% 70%)" strokeWidth="0.5" opacity="0.5" />
            <circle cx="100" cy="100" r="5" fill="hsl(45 100% 85%)" />
          </motion.g>
        </motion.svg>
        {/* Slow rotating outer engraving */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <path id="engrave-path" d="M 100,100 m -88,0 a 88,88 0 1,1 176,0 a 88,88 0 1,1 -176,0" />
            </defs>
            <text fontSize="6.5" fill="hsl(38 70% 75%)" opacity="0.6" letterSpacing="2"
              fontFamily="Playfair Display, serif">
              <textPath href="#engrave-path">
                ✦ IKIGAI ✦ THE REASON FOR WHICH YOU WAKE ✦ 生き甲斐 ✦ KNOW THYSELF ✦
              </textPath>
            </text>
          </svg>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="mt-8 max-w-xl mx-auto text-center"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-accent/80 mb-3">Engraved on your compass</p>
        <p className="text-lg md:text-xl font-serif italic leading-relaxed text-primary whitespace-pre-wrap">
          {statement}
        </p>
      </motion.div>
    </div>
  );
}
