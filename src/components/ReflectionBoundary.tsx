import { LifeBuoy } from "lucide-react";

interface ReflectionBoundaryProps {
  /** Optional campus-specific counseling resource. Falls back to generic guidance. */
  counselingHref?: string;
  counselingLabel?: string;
  className?: string;
}

/**
 * A quiet, consistent boundary notice: this is reflection, not counseling.
 * Shown at the start of the journey and on entering heavier modules (e.g. "My Fears").
 * A career-center buyer specifically looks for this; it is a trust and safety element,
 * not decoration.
 */
export function ReflectionBoundary({
  counselingHref,
  counselingLabel = "your campus counseling center",
  className = "",
}: ReflectionBoundaryProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-3 text-sm text-muted-foreground ${className}`}
      role="note"
    >
      <LifeBuoy className="mt-0.5 h-4 w-4 shrink-0 text-accent/80" aria-hidden="true" />
      <p className="leading-relaxed">
        This is a space for honest reflection — not a substitute for counseling. If anything
        here feels heavy, that&apos;s human, and{" "}
        {counselingHref ? (
          <a
            href={counselingHref}
            className="underline underline-offset-2 hover:text-accent"
            target="_blank"
            rel="noreferrer"
          >
            {counselingLabel}
          </a>
        ) : (
          <span className="text-foreground/80">{counselingLabel}</span>
        )}{" "}
        is here for you.
      </p>
    </div>
  );
}
