import { NextResponse } from "next/server";
import { getFrames } from "@/lib/frames";

export async function GET() {
  try {
    const frames = await getFrames();
    return NextResponse.json({ frames });
  } catch (error) {
    console.error("Error loading frames:", error);
    return NextResponse.json(
      { error: "Failed to load frames" },
      { status: 500 }
    );
  }
}
