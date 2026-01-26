// lib/toc.ts
export type Heading = {
  id: string;
  text: string;
  level: number;
};

export function extractHeadings(content: string): Heading[] {
  const headingRegex = /^(#{1,3})\s+(.*)$/gm;
  const headings: Heading[] = [];
  const slugCounts = new Map<string, number>();
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const baseId = text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\u4e00-\u9fa5-]/g, "");

    const existing = slugCounts.get(baseId) ?? 0;
    const id = existing === 0 ? baseId : `${baseId}-${existing}`;
    slugCounts.set(baseId, existing + 1);

    headings.push({ id, text, level });
  }

  return headings;
}
