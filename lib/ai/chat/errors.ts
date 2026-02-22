import { NextResponse } from "next/server";
import type { ChatApiErrorBody, ChatApiErrorCode } from "@/lib/ai/chat/types";

/**
 * Structured chat API error used across route/service modules.
 */
export class ChatApiError extends Error {
  readonly code: ChatApiErrorCode;
  readonly status: number;

  constructor(code: ChatApiErrorCode, status: number, message: string) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

/**
 * Convert known/unknown errors to a stable JSON response shape.
 */
export function toChatErrorResponse(error: unknown): NextResponse<ChatApiErrorBody> {
  if (error instanceof ChatApiError) {
    return NextResponse.json(
      {
        code: error.code,
        error: error.message,
      },
      { status: error.status }
    );
  }

  return NextResponse.json(
    {
      code: "INTERNAL_ERROR",
      error: "Unexpected internal error.",
    },
    { status: 500 }
  );
}

