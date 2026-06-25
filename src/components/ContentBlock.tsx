import type { ContentBlock as ContentBlockType } from "@/lib/types";
import { QuoteBlock } from "./QuoteBlock";

interface ContentBlockProps {
  blocks: ContentBlockType[];
}

export function ContentBlock({ blocks }: ContentBlockProps) {
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'quote':
            return <QuoteBlock key={i} text={block.text} author={block.author} />;
          case 'heading': {
            const Tag = block.level === 3 ? 'h4' : block.level === 2 ? 'h3' : 'h2';
            const size = block.level === 3 ? 'text-lg' : block.level === 2 ? 'text-xl' : 'text-2xl';
            return <Tag key={i} className={`font-serif font-bold text-primary ${size}`}>{block.text}</Tag>;
          }
          case 'framework':
            return (
              <div key={i} className="bg-secondary/50 border border-border/40 rounded-xl p-5">
                <p className="text-foreground/85 leading-relaxed text-base whitespace-pre-line">{block.text}</p>
              </div>
            );
          case 'callout':
            return (
              <div key={i} className="bg-accent/[0.08] border-l-4 border-accent rounded-r-lg py-4 px-5">
                <p className="text-foreground/85 leading-relaxed text-base italic">{block.text}</p>
              </div>
            );
          default:
            return (
              <p key={i} className="text-foreground/85 leading-relaxed text-lg font-light">{block.text}</p>
            );
        }
      })}
    </div>
  );
}
