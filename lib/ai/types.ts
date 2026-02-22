/**
 * Stable error codes for invite-session APIs.
 */
export type InviteSessionErrorCode =
  | "INVALID_INVITE_CODE"
  | "INVITE_CODE_DISABLED"
  | "INVITE_CODE_EXHAUSTED"
  | "UNAUTHORIZED"
  | "RATE_LIMITED"
  | "INVALID_REQUEST"
  | "INTERNAL_ERROR";

/**
 * Public invite-session state returned to clients.
 */
export type InviteSessionPublic = {
  authenticated: boolean;
  expiresAt: string | null;
  inviteLabel: string | null;
};

/**
 * Structured invite-session API error payload.
 */
export type InviteSessionError = {
  code: InviteSessionErrorCode;
  message: string;
};

/**
 * API response envelope for invite-session endpoints.
 */
export type InviteSessionApiResponse =
  | {
      ok: true;
      session: InviteSessionPublic;
    }
  | {
      ok: false;
      error: InviteSessionError;
    };
