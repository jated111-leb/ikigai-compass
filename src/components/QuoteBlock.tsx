interface QuoteBlockProps {
  text: string;
  author?: string;
}

export function QuoteBlock({ text, author }: QuoteBlockProps) {
  return (
    <blockquote className="border-l-4 border-quote-border bg-quote-bg rounded-r-lg py-4 px-6 my-6">
      <p className="italic text-foreground/80 text-lg leading-relaxed font-serif">
        "{text}"
      </p>
      {author && (
        <cite className="block mt-2 text-sm text-muted-foreground not-italic font-sans">
          — {author}
        </cite>
      )}
    </blockquote>
  );
}
