import { NextResponse } from "next/server";

import { getResourcesData } from "@/lib/data/resources";

export async function GET() {
  const data = await getResourcesData();
  return NextResponse.json(data);
}
