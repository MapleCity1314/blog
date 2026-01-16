import { NextResponse } from "next/server";
import { sendAccessEmail } from "@/lib/friends/mailer";
import { createAccessRequest, verifyAccessToken, writeAccessOutbox } from "@/lib/friends/store";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = process.env.FRIENDS_ADMIN_EMAIL || "presto1314@qq.com";

export async function GET(request: Request) {
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
    const record = await createAccessRequest();
    const origin = new URL(request.url).origin;
    const confirmUrl = `${origin}/friends?friendAccess=${record.token}`;

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
