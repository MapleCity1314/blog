"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { SystemInput } from "@/components/ui/system-input";
import type { PostActionState } from "./actions";

type PostFormProps = {
  action: (state: PostActionState, formData: FormData) => Promise<PostActionState>;
  initialState?: PostActionState;
  defaultValues: {
    title: string;
    slug: string;
    date: string;
    description: string;
    tags: string;
    published: boolean;
    cover: string;
    content: string;
    originalSlug?: string;
  };
  submitLabel: string;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/40 transition disabled:opacity-60 touch-manipulation"
    >
      {pending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
      {label}
    </button>
  );
}

export default function PostForm({
  action,
  initialState = {},
  defaultValues,
  submitLabel,
}: PostFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error && formRef.current) {
      const firstField = formRef.current.querySelector<HTMLElement>("[data-field]");
      firstField?.focus();
    }
  }, [state.error]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {defaultValues.originalSlug ? (
        <input type="hidden" name="original_slug" value={defaultValues.originalSlug} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <SystemInput
          label="Title"
          name="title"
          defaultValue={defaultValues.title}
          data-field
        />
        <SystemInput
          label="Slug"
          name="slug"
          defaultValue={defaultValues.slug}
          spellCheck={false}
          autoComplete="off"
        />
        <SystemInput
          label="Date"
          name="date"
          type="date"
          defaultValue={defaultValues.date}
        />
        <SystemInput label="Cover_URL" name="cover" defaultValue={defaultValues.cover} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <SystemInput
            label="Description"
            name="description"
            defaultValue={defaultValues.description}
            autoComplete="off"
          />
        </div>
        <SystemInput
          label="Tags (comma separated)"
          name="tags"
          defaultValue={defaultValues.tags}
          autoComplete="off"
        />
        <label className="flex items-center gap-3 text-[10px] font-mono uppercase text-muted-foreground">
          <input
            type="checkbox"
            name="published"
            defaultChecked={defaultValues.published}
            className="h-4 w-4 border border-border/60 bg-background/60"
          />
          Published
        </label>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-mono uppercase text-muted-foreground">
          Content (Ctrl/⌘ + Enter to save)
        </label>
        <textarea
          name="content"
          defaultValue={defaultValues.content}
          rows={18}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
          className="w-full resize-y rounded-lg border border-border/60 bg-background/60 p-3 font-mono text-xs leading-relaxed text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
        />
      </div>

      {state.error ? (
        <p className="text-xs font-mono text-amber-400 uppercase">{state.error}</p>
      ) : null}

      <SubmitButton label={submitLabel} />
    </form>
  );
}
