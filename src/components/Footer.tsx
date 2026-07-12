import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border/40 mt-auto">
      <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col items-center gap-3 text-center">
        <Logo size="sm" showText={false} />
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Ikigai Compass
        </p>
        <p className="text-[11px] leading-relaxed text-muted-foreground/70 max-w-md">
          Ikigai (生き甲斐) is a Japanese idea about what makes life feel worth living. The
          four-circle framework used here is a modern, Western adaptation — a practical lens for
          finding direction, not a claim to the whole tradition.
        </p>
      </div>
    </footer>
  );
}
