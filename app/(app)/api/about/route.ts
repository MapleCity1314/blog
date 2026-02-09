import { NextResponse } from "next/server";

import { getAboutData } from "@/lib/data/about";

export async function GET() {
  const data = await getAboutData();
  return NextResponse.json(data);
}
