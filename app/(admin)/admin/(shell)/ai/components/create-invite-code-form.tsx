"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Copy, Eye, EyeOff, TriangleAlert } from "lucide-react";
import { createAiInviteCode, type CreateAiInviteCodeState } from "../actions";

const initialState: CreateAiInviteCodeState = {};

function CreateButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex min-h-11 items-center rounded-md bg-foreground px-4 py-2 text-[11px] font-mono uppercase tracking-widest text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Creating…" : "Create"}
    </button>
  );
}

export default function CreateInviteCodeForm() {
  const [state, formAction] = useActionState(createAiInviteCode, initialState);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const code = state.createdCode ?? "";
  const hasCode = code.length > 0;

  useEffect(() => {
    if (!hasCode) return;
    setIsDialogOpen(true);
    setIsVisible(false);
    setIsCopied(false);
  }, [hasCode, code]);

  useEffect(() => {
    if (!isDialogOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDialogOpen]);

  const copyDisabled = useMemo(() => !hasCode, [hasCode]);

  async function handleCopy() {
    if (!hasCode) return;
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
    } catch {
      setIsCopied(false);
    }
  }

  return (
    <>
      <form action={formAction} className="grid gap-4 md:grid-cols-2">
        <input type="hidden" name="redirect_to" value="/admin/ai" />
        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase text-muted-foreground">Label</label>
          <input
            name="label"
            placeholder="e.g. internal test"
            className="w-full border border-border/60 bg-background/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase text-muted-foreground">
            Invite_Code (optional)
          </label>
          <input
            name="invite_code"
            placeholder="leave empty to auto-generate"
            className="w-full border border-border/60 bg-background/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase text-muted-foreground">Token_Quota</label>
          <input
            name="token_quota"
            type="number"
            min={0}
            step={1}
            defaultValue={500000}
            required
            className="w-full border border-border/60 bg-background/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase text-muted-foreground">Notes</label>
          <input
            name="notes"
            placeholder="team / use case / expiry policy"
            className="w-full border border-border/60 bg-background/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          {state.error ? (
            <p className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {state.error}
            </p>
          ) : null}
        </div>
        <div className="md:col-span-2 flex justify-end">
          <CreateButton />
        </div>
      </form>

      {isDialogOpen && hasCode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-md"
            onClick={() => setIsDialogOpen(false)}
            aria-hidden
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-label="New invite code"
            className="relative z-10 w-full max-w-xl border border-border/70 bg-background/95 p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start gap-3">
              <TriangleAlert className="mt-0.5 h-5 w-5 text-amber-400" aria-hidden />
              <div className="space-y-1">
                <h4 className="text-base font-semibold">邀请码已创建</h4>
                <p className="text-sm text-muted-foreground">
                  该邀请码不会再次明文展示，请现在完成保存或复制。
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="new-invite-code"
                className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground"
              >
                Invite_Code (one-time reveal)
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  id="new-invite-code"
                  readOnly
                  value={code}
                  type={isVisible ? "text" : "password"}
                  className="min-h-11 flex-1 border border-border/60 bg-background/60 px-3 py-2 text-sm font-mono focus-visible:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsVisible((prev) => !prev)}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center border border-border/60 bg-background/70 px-3 transition hover:bg-accent"
                  aria-label={isVisible ? "Hide invite code" : "Show invite code"}
                  title={isVisible ? "Hide code" : "Show code"}
                >
                  {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={copyDisabled}
                  className="inline-flex min-h-11 items-center gap-2 border border-border/60 bg-background/70 px-3 text-xs font-mono uppercase transition hover:bg-accent disabled:opacity-60"
                >
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  {isCopied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {isCopied ? "邀请码已复制到剪贴板。" : "建议立即粘贴到安全位置保存。"}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="inline-flex min-h-11 items-center rounded-md border border-border px-4 py-2 text-[11px] font-mono uppercase tracking-widest hover:bg-accent"
              >
                我已保存
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
