import { NextResponse } from "next/server";
import {
  approveAccessToken,
  createAccessRequest,
  verifyPendingAccessToken,
} from "@/lib/friends/store";
import { checkRateLimit } from "@/lib/security";

export async function GET(request: Request) {
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const rateKey = `friends-access-get:${clientIp}`;
  const allowed = await checkRateLimit(rateKey, 30, 1000 * 60 * 10);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim() || "";
  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  const status = await verifyPendingAccessToken(token);
  if (!status.ok) {
    return NextResponse.json({ error: "Invalid token.", reason: status.reason }, { status: 401 });
  }

  const approved = await approveAccessToken(token);
  if (!approved) {
    return NextResponse.json({ error: "Token cannot be approved." }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const rateKey = `friends-access-post:${clientIp}`;
    const allowed = await checkRateLimit(rateKey, 5, 1000 * 60 * 30);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many access requests. Please try again later." },
        { status: 429 }
      );
    }

    const record = await createAccessRequest();
    const approved = await approveAccessToken(record.token);
    if (!approved) {
      return NextResponse.json({ error: "Failed to grant access." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, accessToken: record.token }, { status: 201 });
  } catch (error) {
    console.error("Failed to create access request:", error);
    return NextResponse.json({ error: "Failed to create access request." }, { status: 500 });
  }
}
