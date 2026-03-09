import { cn } from "@/lib/utils";
import type { ContentBlock as ContentBlockType } from "@/lib/types";
import { QuoteBlock } from "./QuoteBlock";

interface ContentBlockProps {
  blocks: ContentBlockType[];
}

export function ContentBlock({ blocks }: ContentBlockProps) {
  return (
    <div className="space-y-5">
      {blocks.map((block, i) =>
        block.type === 'quote' ? (
          <QuoteBlock key={i} text={block.text} author={block.author} />
        ) : (
          <p key={i} className="text-foreground/85 leading-relaxed text-lg font-light">
            {block.text}
          </p>
        )
      )}
    </div>
  );
}
