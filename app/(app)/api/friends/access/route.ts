import { NextResponse } from "next/server";
import { sendAccessEmail } from "@/lib/friends/mailer";
import { createAccessRequest, verifyAccessToken, writeAccessOutbox } from "@/lib/friends/store";
import { checkRateLimit, getSiteBaseUrl } from "@/lib/security";


const ADMIN_EMAIL = process.env.FRIENDS_ADMIN_EMAIL || "presto1314@qq.com";

export async function GET(request: Request) {
  // 对 token 校验也做简单限流，防止暴力尝试
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const rateKey = `friends-access-get:${clientIp}`;
  const allowed = await checkRateLimit(rateKey, 30, 1000 * 60 * 10); // 10 分钟内最多 30 次
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
  const status = await verifyAccessToken(token);
  if (!status.ok) {
    return NextResponse.json({ error: "Invalid token.", reason: status.reason }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  try {
    // 限制 access 请求频率，防止邮件轰炸
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const rateKey = `friends-access-post:${clientIp}`;
    const allowed = await checkRateLimit(rateKey, 5, 1000 * 60 * 30); // 30 分钟内最多 5 次
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many access requests. Please try again later." },
        { status: 429 }
      );
    }

    const record = await createAccessRequest();
    const baseUrl = getSiteBaseUrl();
    const confirmUrl = `${baseUrl}/friends?friendAccess=${record.token}`;

    await sendAccessEmail({ to: ADMIN_EMAIL, confirmUrl });
    await writeAccessOutbox({ to: ADMIN_EMAIL, confirmUrl, token: record.token });

    const responseBody: { ok: true; email: string; devConfirmUrl?: string } = {
      ok: true,
      email: ADMIN_EMAIL,
    };

    if (process.env.NODE_ENV !== "production") {
      responseBody.devConfirmUrl = confirmUrl;
    }

    return NextResponse.json(responseBody, { status: 201 });
  } catch (error) {
    console.error("Failed to create access request:", error);
    return NextResponse.json({ error: "Failed to create access request." }, { status: 500 });
  }
}
