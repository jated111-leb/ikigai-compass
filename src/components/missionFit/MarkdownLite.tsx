// Minimal markdown renderer for AI-generated dossiers & profiles.
// Handles "## "/"### " headings, "- " bullets, "1." ordered items,
// **bold** inline, and blank-line spacing. No external dependency.

import { Fragment } from 'react';

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

export function MarkdownLite({ text, className = '' }: { text: string; className?: string }) {
  const lines = text.split('\n');
  const blocks: JSX.Element[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushList = (key: string) => {
    if (!list) return;
    const items = list.items;
    blocks.push(
      list.ordered ? (
        <ol key={key} className="list-decimal pl-5 space-y-1.5 my-2 text-muted-foreground">
          {items.map((it, i) => <li key={i}>{renderInline(it)}</li>)}
        </ol>
      ) : (
        <ul key={key} className="list-disc pl-5 space-y-1.5 my-2 text-muted-foreground">
          {items.map((it, i) => <li key={i}>{renderInline(it)}</li>)}
        </ul>
      )
    );
    list = null;
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const key = `b${idx}`;
    const ordered = /^\d+\.\s+/.test(line);
    const bullet = /^[-*]\s+/.test(line);

    if (line.startsWith('## ')) {
      flushList(key + 'l');
      blocks.push(
        <h3 key={key} className="font-serif text-xl text-foreground mt-6 mb-2 first:mt-0">
          {line.slice(3)}
        </h3>
      );
    } else if (line.startsWith('### ')) {
      flushList(key + 'l');
      blocks.push(<h4 key={key} className="font-medium text-foreground mt-4 mb-1.5">{line.slice(4)}</h4>);
    } else if (bullet) {
      if (!list || list.ordered) flushList(key + 'l');
      list = list && !list.ordered ? list : { ordered: false, items: [] };
      list.items.push(line.replace(/^[-*]\s+/, ''));
    } else if (ordered) {
      if (!list || !list.ordered) flushList(key + 'l');
      list = list && list.ordered ? list : { ordered: true, items: [] };
      list.items.push(line.replace(/^\d+\.\s+/, ''));
    } else if (line.trim() === '') {
      flushList(key + 'l');
    } else {
      flushList(key + 'l');
      blocks.push(<p key={key} className="text-muted-foreground leading-relaxed my-2">{renderInline(line)}</p>);
    }
  });
  flushList('final');

  return <div className={className}>{blocks}</div>;
}
