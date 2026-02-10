import { NextResponse } from "next/server";

import { getPostViews, incrementPostViews } from "@/lib/post-views";

type RouteParams = {
  params: Promise<{ slug: string }>;
};

function isValidSlug(slug: string) {
  return slug.length > 0 && slug.length < 256;
}

export async function GET(_: Request, { params }: RouteParams) {
  const { slug } = await params;
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: "Invalid slug." }, { status: 400 });
  }

  const views = await getPostViews(slug);
  return NextResponse.json({ slug, views });
}

export async function POST(_: Request, { params }: RouteParams) {
  const { slug } = await params;
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: "Invalid slug." }, { status: 400 });
  }

  const views = await incrementPostViews(slug);
  return NextResponse.json({ slug, views });
}
