interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { svg: 28, text: 'text-base' },
  md: { svg: 40, text: 'text-xl' },
  lg: { svg: 56, text: 'text-3xl' },
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
      >
        {/* Four overlapping circles — the classic Ikigai Venn */}
        <circle cx="42" cy="42" r="28" fill="hsl(38 92% 44% / 0.25)" stroke="hsl(38 92% 44%)" strokeWidth="1.5" />
        <circle cx="58" cy="42" r="28" fill="hsl(243 45% 20% / 0.20)" stroke="hsl(243 45% 20%)" strokeWidth="1.5" />
        <circle cx="42" cy="58" r="28" fill="hsl(150 50% 35% / 0.20)" stroke="hsl(150 50% 35%)" strokeWidth="1.5" />
        <circle cx="58" cy="58" r="28" fill="hsl(0 84% 60% / 0.18)" stroke="hsl(0 84% 60% / 0.7)" strokeWidth="1.5" />
        {/* Center dot — the Ikigai intersection */}
        <circle cx="50" cy="50" r="4" fill="hsl(38 92% 44%)" />
      </svg>
      {showText && (
        <span className={`font-serif font-bold text-primary leading-none ${text}`}>
          Ikigai Journey
        </span>
      )}
    </div>
  );
}
