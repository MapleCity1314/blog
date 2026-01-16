// lib/toc.ts
export type Heading = {
  id: string;
  text: string;
  level: number;
};

export function extractHeadings(content: string): Heading[] {
  // 使用正则匹配 Markdown 标题 (#, ##, ###)
  // 注意：这只是一个简单的正则，如果标题里有代码块可能会误判，但对大多数博客够用了
  const headingRegex = /^(#{1,3})\s+(.*)$/gm;
  const headings: Heading[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length; // # 的数量即为层级
    const text = match[2].trim();
    // 生成简单的 slug id (需与 rehype-slug 生成规则一致)
    // 这里简单处理：转小写，空格变横杠，去除非法字符
    const id = text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\u4e00-\u9fa5-]/g, ""); 

    headings.push({ id, text, level });
  }

  return headings;
}
