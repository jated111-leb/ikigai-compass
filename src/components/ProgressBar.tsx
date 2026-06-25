import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, label, size = 'md' }: ProgressBarProps) {
  const height = size === 'sm' ? 'h-1.5' : 'h-2';
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between text-xs text-muted-foreground tracking-wide uppercase">
          <span>{label}</span>
          <motion.span
            key={Math.round(clamped)}
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-accent font-medium"
          >
            {Math.round(clamped)}%
          </motion.span>
        </div>
      )}
      <div className={`relative w-full ${height} bg-secondary/60 rounded-full overflow-hidden border border-border/60`}>
        <motion.div
          className={`${height} rounded-full relative overflow-hidden`}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: 'linear-gradient(90deg, hsl(var(--accent)), hsl(38 100% 70%), hsl(var(--accent)))',
            boxShadow: '0 0 12px hsl(var(--accent) / 0.6)',
          }}
        >
          {/* candlelit shimmer sweep */}
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background: 'linear-gradient(90deg, transparent, hsl(38 100% 90% / 0.75), transparent)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2.5s linear infinite',
            }}
          />
          {/* flickering candle flame at the leading edge */}
          {clamped > 0 && clamped < 100 && (
            <motion.div
              aria-hidden
              className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 rounded-full"
              style={{
                width: size === 'sm' ? 8 : 12,
                height: size === 'sm' ? 8 : 12,
                background:
                  'radial-gradient(circle, hsl(48 100% 88%) 0%, hsl(38 100% 65% / 0.9) 45%, transparent 75%)',
                filter: 'blur(0.5px)',
              }}
              animate={{
                opacity: [0.7, 1, 0.75, 1, 0.85],
                scale: [1, 1.25, 0.95, 1.15, 1],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
