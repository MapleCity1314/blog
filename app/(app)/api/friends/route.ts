import { NextResponse } from "next/server";
import { addFriend, consumeAccessToken, getFriends, verifyAccessToken } from "@/lib/friends/store";
import type { FriendInput } from "@/lib/friends/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const friends = await getFriends();
  return NextResponse.json({ friends }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as FriendInput & { accessToken?: string };
    const accessToken = payload.accessToken?.trim() || "";
    if (!accessToken) {
      return NextResponse.json({ error: "Missing access token." }, { status: 401 });
    }

    const accessStatus = await verifyAccessToken(accessToken);
    if (!accessStatus.ok) {
      return NextResponse.json({ error: "Access token is invalid." }, { status: 401 });
    }

    const input: FriendInput = {
      name: payload.name?.trim() || "",
      avatar: payload.avatar?.trim() || "",
      role: payload.role?.trim() || "",
      url: payload.url?.trim() || "",
      desc: payload.desc?.trim() || "",
      color: payload.color?.trim() || "",
    };

    const missing = Object.entries(input).filter(([, value]) => value.length === 0);
    if (missing.length > 0) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    try {
      new URL(input.url);
      new URL(input.avatar);
    } catch {
      return NextResponse.json({ error: "Invalid URL format." }, { status: 400 });
    }

    const friend = await addFriend(input);
    await consumeAccessToken(accessToken);
    return NextResponse.json({ friend }, { status: 201 });
  } catch (error) {
    console.error("Failed to create friend:", error);
    return NextResponse.json({ error: "Failed to create friend." }, { status: 500 });
  }
}
