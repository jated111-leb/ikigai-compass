interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, label, size = 'md' }: ProgressBarProps) {
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';
  return (
    <div className="space-y-1">
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      <div className={`w-full ${height} bg-secondary rounded-full overflow-hidden`}>
        <div
          className={`${height} bg-accent rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
