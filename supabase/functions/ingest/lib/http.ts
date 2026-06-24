// Small fetch helpers shared by collectors: timeouts, a polite User-Agent,
// and JSON/text convenience wrappers.

const UA = "IkigaiTrendEngine/0.1 (+https://github.com/jated111-leb/ikigai-compass)";

export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 15000,
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: { "User-Agent": UA, ...(init.headers ?? {}) },
    });
  } finally {
    clearTimeout(t);
  }
}

export async function getJson<T = unknown>(
  url: string,
  init: RequestInit = {},
  timeoutMs = 15000,
): Promise<T> {
  const res = await fetchWithTimeout(url, init, timeoutMs);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return (await res.json()) as T;
}

export async function getText(
  url: string,
  init: RequestInit = {},
  timeoutMs = 15000,
): Promise<string> {
  const res = await fetchWithTimeout(url, init, timeoutMs);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return await res.text();
}

// Some Google endpoints prefix JSON with ")]}'" to defeat XSSI. Strip it.
export function stripXssiPrefix(text: string): string {
  return text.replace(/^\)\]\}'?\s*/, "");
}

export function isoDaysAgo(now: Date, days: number): string {
  return new Date(now.getTime() - days * 86400000).toISOString();
}

// Dependency-free RSS/Atom item extraction. Returns the inner blocks for
// each <item> (RSS) or <entry> (Atom).
export function splitFeedItems(xml: string): string[] {
  const items = [...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)].map((m) => m[0]);
  if (items.length) return items;
  return [...xml.matchAll(/<entry[\s>][\s\S]*?<\/entry>/gi)].map((m) => m[0]);
}

// Extract the text content of the first matching tag (handles CDATA).
export function tagText(block: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(re);
  if (!m) return undefined;
  return decodeEntities(
    m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "").trim(),
  );
}

// Extract an attribute (e.g. Atom <link href="...">).
export function tagAttr(block: string, tag: string, attr: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*\\b${attr}=["']([^"']+)["']`, "i");
  return block.match(re)?.[1];
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}
