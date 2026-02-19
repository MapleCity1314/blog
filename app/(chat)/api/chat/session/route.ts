import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createInviteSession,
  getClientIp,
  getClearedInviteSessionCookieOptions,
  getInviteSessionByToken,
  getInviteSessionCookieName,
  getInviteSessionCookieOptions,
  revokeInviteSession,
} from "@/lib/ai/invite-session";
import type { InviteSessionApiResponse, InviteSessionErrorCode } from "@/lib/ai/types";
import { checkRateLimit } from "@/lib/security";

function errorResponse(
  code: InviteSessionErrorCode,
  message: string,
  status: number
): NextResponse<InviteSessionApiResponse> {
  return NextResponse.json(
    {
      ok: false,
      error: { code, message },
    },
    { status }
  );
}

function successResponse(
  expiresAt: Date | null,
  inviteLabel: string | null
): NextResponse<InviteSessionApiResponse> {
  return NextResponse.json({
    ok: true,
    session: {
      authenticated: Boolean(expiresAt),
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      inviteLabel,
    },
  });
}

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(getInviteSessionCookieName())?.value ?? null;
  const session = await getInviteSessionByToken(sessionToken);
  if (!session) {
    return successResponse(null, null);
  }

  return successResponse(session.expiresAt, session.inviteLabel);
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateKey = `chat-invite-post:${clientIp}`;
  const allowed = await checkRateLimit(rateKey, 20, 1000 * 60 * 10);
  if (!allowed) {
    return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", 429);
  }

  let inviteCode = "";
  try {
    const body = (await request.json()) as { inviteCode?: string };
    inviteCode = String(body.inviteCode ?? "").trim();
  } catch {
    return errorResponse("INVALID_REQUEST", "Invalid request payload.", 400);
  }

  if (!inviteCode) {
    return errorResponse("INVALID_REQUEST", "Invite code is required.", 400);
  }

  const cookieStore = await cookies();
  const previousSessionToken = cookieStore.get(getInviteSessionCookieName())?.value ?? null;
  const created = await createInviteSession(inviteCode, previousSessionToken);
  if (!created.ok) {
    if (created.reason === "invite_code_disabled") {
      return errorResponse("INVALID_INVITE_CODE", "Invalid invite code.", 401);
    }
    if (created.reason === "invite_code_exhausted") {
      return errorResponse("INVITE_CODE_EXHAUSTED", "Invite code quota exceeded.", 403);
    }
    return errorResponse("INVALID_INVITE_CODE", "Invalid invite code.", 401);
  }

  const response = successResponse(created.expiresAt, created.inviteLabel);
  response.cookies.set(
    getInviteSessionCookieName(),
    created.sessionToken,
    getInviteSessionCookieOptions()
  );
  return response;
}

export async function DELETE() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(getInviteSessionCookieName())?.value ?? null;
  await revokeInviteSession(sessionToken);

  const response = successResponse(null, null);
  response.cookies.set(getInviteSessionCookieName(), "", getClearedInviteSessionCookieOptions());
  return response;
}

