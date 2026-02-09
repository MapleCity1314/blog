// app/api/metadata/route.ts
import { NextResponse } from 'next/server';
import { parse } from 'node-html-parser';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // 缓存1小时
    const html = await response.text();
    const root = parse(html);

    const getMeta = (name: string) => 
      root.querySelector(`meta[property="${name}"]`)?.getAttribute('content') ||
      root.querySelector(`meta[name="${name}"]`)?.getAttribute('content');

    return NextResponse.json({
      title: getMeta('og:title') || root.querySelector('title')?.innerText,
      description: getMeta('og:description') || getMeta('description'),
      image: getMeta('og:image'),
      favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
}