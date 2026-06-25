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
          <span className="text-accent font-medium">{Math.round(clamped)}%</span>
        </div>
      )}
      <div className={`relative w-full ${height} bg-secondary/60 rounded-full overflow-hidden border border-border/60`}>
        <div
          className={`${height} rounded-full transition-all duration-700 ease-out relative overflow-hidden`}
          style={{
            width: `${clamped}%`,
            background: 'linear-gradient(90deg, hsl(var(--accent)), hsl(38 100% 70%), hsl(var(--accent)))',
            boxShadow: '0 0 12px hsl(var(--accent) / 0.6)',
          }}
        >
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background: 'linear-gradient(90deg, transparent, hsl(38 100% 90% / 0.7), transparent)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2.5s linear infinite',
            }}
          />
        </div>
      </div>
    </div>
  );
}
