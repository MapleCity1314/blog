"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Plus } from "lucide-react";
import { SystemInput } from "@/components/ui/system-input";
import type { PostActionState } from "./actions";
import { createDraft } from "./actions";

const initialState: PostActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary px-6 py-3 text-xs font-mono font-bold text-primary-foreground uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-70 touch-manipulation"
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
      Create_New_Entry
    </button>
  );
}

export default function CreatePostForm() {
  const [state, formAction] = useActionState(createDraft, initialState);

  return (
    <form action={formAction} className="w-full flex flex-col md:flex-row gap-4 items-center">
      <div className="w-full md:w-80">
        <SystemInput label="Title" name="title" required />
      </div>
      <div className="w-full md:w-80">
        <SystemInput label="Slug" name="slug" spellCheck={false} autoComplete="off" />
      </div>
      <SubmitButton />
      {state.error ? (
        <span className="text-[10px] font-mono uppercase text-amber-400">{state.error}</span>
      ) : null}
    </form>
  );
}
