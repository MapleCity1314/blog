import { NextResponse } from "next/server";
import { getFriends, submitFriendRequest, verifyAccessToken } from "@/lib/friends/store";
import type { FriendInput } from "@/lib/friends/types";
import { checkRateLimit } from "@/lib/security";
import { revalidatePath } from "next/cache";

export async function GET() {
  const friends = await getFriends();
  return NextResponse.json({ friends }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    // 为创建友链增加简单限流，防止短时间重复提交
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const rateKey = `friends-post:${clientIp}`;
    const allowed = await checkRateLimit(rateKey, 10, 1000 * 60 * 60); // 1 小时内最多 10 次
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

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

    const requestId = await submitFriendRequest(accessToken, input);
    if (!requestId) {
      return NextResponse.json({ error: "Access token is invalid." }, { status: 401 });
    }

    revalidatePath("/friends");
    revalidatePath("/admin/friends");
    return NextResponse.json({ ok: true, requestId }, { status: 201 });
  } catch (error) {
    console.error("Failed to create friend:", error);
    return NextResponse.json({ error: "Failed to create friend." }, { status: 500 });
  }
}
