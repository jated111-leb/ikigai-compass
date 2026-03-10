import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border/40 mt-auto">
      <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col items-center gap-2">
        <Logo size="sm" showText={false} />
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Ikigai Journey
        </p>
      </div>
    </footer>
  );
}
