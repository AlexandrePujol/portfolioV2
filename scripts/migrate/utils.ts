import { readFileSync } from "node:fs";
import { join } from "node:path";

type Span = { type: "strong" | "em"; start: number; end: number };
type RichTextBlock = { type: string; text: string; spans: Span[] };

/** A URL is fetched remotely; anything else is read from `public/` as a local file. */
export function assetSource(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return readFileSync(join(process.cwd(), "public", pathOrUrl));
}

export function filenameFor(
  pathOrUrl: string,
  fallbackBase: string,
  fallbackExt: string
) {
  const last = pathOrUrl.split("?")[0].split("/").pop() || "";
  return last.includes(".") ? last : `${fallbackBase}.${fallbackExt}`;
}

export function heading1(text: string): RichTextBlock[] {
  return [{ type: "heading1", text, spans: [] }];
}

function paragraphBlock(text: string, bold: string[] = []): RichTextBlock {
  const spans: Span[] = [];
  for (const sub of bold) {
    const start = text.indexOf(sub);
    if (start === -1) throw new Error(`Bold substring not found: "${sub}"`);
    spans.push({ type: "strong", start, end: start + sub.length });
  }
  spans.sort((a, b) => a.start - b.start);
  return { type: "paragraph", text, spans };
}

/** A single paragraph, optionally with substrings turned into bold spans. */
export function paragraph(text: string, bold: string[] = []): RichTextBlock[] {
  return [paragraphBlock(text, bold)];
}

/** Several paragraphs, each optionally with its own bold substrings. */
export function richText(
  paragraphs: Array<{ text: string; bold?: string[] }>
): RichTextBlock[] {
  return paragraphs.map((p) => paragraphBlock(p.text, p.bold ?? []));
}

export function webLink(url?: string) {
  return url ? { link_type: "Web" as const, url } : undefined;
}
