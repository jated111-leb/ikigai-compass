interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { svg: 28, text: 'text-base' },
  md: { svg: 40, text: 'text-xl' },
  lg: { svg: 72, text: 'text-3xl' },
};

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const { svg, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={svg}
        height={svg}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={size === 'lg' ? 'animate-spin-slow' : ''}
        style={size === 'lg' ? { filter: 'drop-shadow(0 0 18px hsl(38 92% 58% / 0.5))' } : undefined}
      >
        <circle cx="42" cy="42" r="28" fill="hsl(38 92% 58% / 0.18)" stroke="hsl(38 92% 58%)" strokeWidth="1.2" />
        <circle cx="58" cy="42" r="28" fill="hsl(280 60% 55% / 0.14)" stroke="hsl(280 60% 65%)" strokeWidth="1.2" />
        <circle cx="42" cy="58" r="28" fill="hsl(150 50% 50% / 0.14)" stroke="hsl(150 50% 55%)" strokeWidth="1.2" />
        <circle cx="58" cy="58" r="28" fill="hsl(0 70% 60% / 0.12)" stroke="hsl(0 70% 65%)" strokeWidth="1.2" />
        <circle cx="50" cy="50" r="4" fill="hsl(38 92% 58%)" />
      </svg>
      {showText && (
        <span className={`font-serif font-bold text-foreground leading-none tracking-tight ${text}`}>
          Ikigai Journey
        </span>
      )}
    </div>
  );
}
