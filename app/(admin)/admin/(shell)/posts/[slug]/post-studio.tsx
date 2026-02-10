"use client";

import { useActionState, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import type { editor as MonacoEditorNS } from "monaco-editor";
import {
  AlertTriangle,
  Command,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Save,
  Search,
  Send,
  Trash2,
  Upload,
} from "lucide-react";
import { useMDXComponents } from "@/mdx-components";
import { SystemInput } from "@/components/ui/system-input";
import PostMonacoEditor from "@/components/admin/post/monaco-editor";
import type { AdminPost, AdminPostMetadata } from "@/lib/admin/posts";
import type { PostActionState } from "../actions";
import { updatePost } from "../actions";

type PostStudioProps = {
  post: AdminPost;
};

type Asset = {
  name: string;
  url: string;
  size: number;
  updatedAt: string;
};

type AutosaveStatus = "idle" | "saving" | "saved" | "error";

type SlashCommand = {
  id: string;
  label: string;
  hint: string;
  snippet: string;
};

const initialState: PostActionState = {};
const SUPPORTED_CODE_LANGUAGES = new Set([
  "",
  "txt",
  "text",
  "md",
  "markdown",
  "mdx",
  "js",
  "jsx",
  "ts",
  "tsx",
  "json",
  "yaml",
  "yml",
  "toml",
  "xml",
  "sh",
  "bash",
  "zsh",
  "powershell",
  "ps1",
  "html",
  "css",
  "scss",
  "sql",
  "python",
  "py",
  "rust",
  "go",
  "java",
  "c",
  "cpp",
  "csharp",
  "cs",
  "php",
  "ruby",
  "rb",
  "swift",
  "kotlin",
  "kt",
  "dart",
  "mermaid",
]);

const slashCommands: SlashCommand[] = [
  { id: "h2", label: "Heading 2", hint: "Section title", snippet: "\n## New Section\n" },
  { id: "h3", label: "Heading 3", hint: "Subsection title", snippet: "\n### Subsection\n" },
  { id: "quote", label: "Quote", hint: "Blockquote", snippet: "\n> Quote...\n" },
  { id: "code", label: "Code Block", hint: "Fenced code", snippet: "\n```ts\n\n```\n" },
  { id: "table", label: "Table", hint: "Markdown table", snippet: "\n| Col A | Col B |\n| --- | --- |\n| 1 | 2 |\n" },
  { id: "callout", label: "Callout", hint: "MDX callout", snippet: '\n<Callout type="info" title="Note">\nContent...\n</Callout>\n' },
  { id: "image", label: "Image", hint: "Markdown image", snippet: "\n![](/posts/slug/image.png)\n" },
  { id: "hr", label: "Divider", hint: "Horizontal rule", snippet: "\n---\n" },
];

function ActionButton({
  intent,
  label,
  icon,
}: {
  intent: "draft" | "publish";
  label: string;
  icon: ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="intent"
      value={intent}
      disabled={pending}
      aria-busy={pending}
      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-foreground transition hover:border-primary/40 hover:text-primary disabled:opacity-60 touch-manipulation"
    >
      {pending ? <Loader2 size={12} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeEditorMarkdown(markdown: string) {
  const normalizedClassName = markdown.replace(/\bclassname=/g, "className=");
  return normalizedClassName.replace(
    /^(\s*)(```|~~~)([^\n`]*)$/gm,
    (_line, indent: string, fence: string, languageRaw: string) => {
      const language = String(languageRaw ?? "").trim();
      if (!language) return `${indent}${fence}`;
      if (language.toLowerCase() === "n/a") return `${indent}${fence}txt`;
      if (!/^[a-z0-9_+-]+$/i.test(language)) return `${indent}${fence}txt`;
      const canonical = language.toLowerCase();
      if (!SUPPORTED_CODE_LANGUAGES.has(canonical)) return `${indent}${fence}txt`;
      return `${indent}${fence}${canonical}`;
    }
  );
}

function createMetadata({
  title,
  date,
  description,
  tags,
  cover,
  published,
}: {
  title: string;
  date: string;
  description: string;
  tags: string;
  cover: string;
  published: boolean;
}): AdminPostMetadata {
  return {
    title,
    date,
    description,
    tags: tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    cover: cover || undefined,
    published,
  };
}

export default function PostStudio({ post }: PostStudioProps) {
  const [state, formAction] = useActionState(updatePost, initialState);
  const [title, setTitle] = useState(post.metadata.title);
  const [slug, setSlug] = useState(post.slug);
  const [date, setDate] = useState(post.metadata.date);
  const [description, setDescription] = useState(post.metadata.description);
  const [tags, setTags] = useState(post.metadata.tags.join(", "));
  const [cover, setCover] = useState(post.metadata.cover ?? "");
  const [content, setContent] = useState(() => normalizeEditorMarkdown(post.content));
  const [PreviewComponent, setPreviewComponent] =
    useState<((props: { components?: Record<string, unknown> }) => ReactNode) | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewRetryKey, setPreviewRetryKey] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetLoading, setAssetLoading] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>("idle");
  const [autosaveAt, setAutosaveAt] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const filePickerRef = useRef<HTMLInputElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null);
  const mdxComponents = useMDXComponents({});
  const hydratedOnceRef = useRef(false);
  const autosaveCheckedSlugRef = useRef<string | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const filteredCommands = useMemo(() => {
    const query = commandQuery.trim().toLowerCase();
    if (!query) return slashCommands;
    return slashCommands.filter(
      (command) =>
        command.label.toLowerCase().includes(query) ||
        command.hint.toLowerCase().includes(query)
    );
  }, [commandQuery]);

  const fingerprint = useMemo(
    () =>
      JSON.stringify({
        title,
        slug,
        date,
        description,
        tags,
        cover,
        content,
      }),
    [title, slug, date, description, tags, cover, content]
  );
  const initialFingerprint = useMemo(
    () =>
      JSON.stringify({
        title: post.metadata.title,
        slug: post.slug,
        date: post.metadata.date,
        description: post.metadata.description,
        tags: post.metadata.tags.join(", "),
        cover: post.metadata.cover ?? "",
        content: normalizeEditorMarkdown(post.content),
      }),
    [post]
  );

  const handleEditorDidMount = (editor: MonacoEditorNS.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  function insertEditorSnippet(snippet: string) {
    const editor = editorRef.current;
    if (!editor) {
      setContent((prev) => normalizeEditorMarkdown(`${prev}${snippet}`));
      return;
    }

    const selection = editor.getSelection();
    const model = editor.getModel();
    if (!selection || !model) {
      setContent((prev) => normalizeEditorMarkdown(`${prev}${snippet}`));
      return;
    }

    editor.executeEdits("post-studio", [
      {
        range: selection,
        text: snippet,
        forceMoveMarkers: true,
      },
    ]);
    editor.focus();
    const next = normalizeEditorMarkdown(model.getValue());
    if (next !== model.getValue()) {
      editor.setValue(next);
    }
    setContent(next);
  }

  function formatPreviewError(error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    try {
      return JSON.stringify(error);
    } catch {
      return "Unknown preview error";
    }
  }

  useEffect(() => {
    setHasUnsavedChanges(
      fingerprint !==
        JSON.stringify({
          title: post.metadata.title,
          slug: post.slug,
          date: post.metadata.date,
          description: post.metadata.description,
          tags: post.metadata.tags.join(", "),
          cover: post.metadata.cover ?? "",
          content: post.content,
        })
    );
  }, [fingerprint, post]);

  useEffect(() => {
    if (!isCommandOpen) return;
    commandInputRef.current?.focus();
  }, [isCommandOpen]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setIsPreviewLoading(true);
      try {
        const result = await evaluate(content, {
          ...runtime,
          remarkPlugins: [remarkMath, remarkGfm],
          rehypePlugins: [rehypeKatex, rehypeSlug],
        });
        if (!active) return;
        setPreviewComponent(() => result.default as typeof PreviewComponent);
        setPreviewError(null);
      } catch (error) {
        if (!active) return;
        setPreviewComponent(null);
        setPreviewError(formatPreviewError(error));
      } finally {
        if (active) setIsPreviewLoading(false);
      }
    }, 1200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [content, previewRetryKey]);

  async function loadAssets() {
    setAssetLoading(true);
    try {
      const response = await fetch(`/admin/api/posts/${encodeURIComponent(post.slug)}/images`);
      const data = (await response.json()) as { assets?: Asset[] };
      setAssets(data.assets ?? []);
    } finally {
      setAssetLoading(false);
    }
  }

  useEffect(() => {
    void loadAssets();
  }, [post.slug]);

  useEffect(() => {
    if (autosaveCheckedSlugRef.current === post.slug) {
      return;
    }
    autosaveCheckedSlugRef.current = post.slug;
    let active = true;
    void (async () => {
      const response = await fetch(`/admin/api/posts/${encodeURIComponent(post.slug)}/autosave`);
      if (!response.ok) return;
      const data = (await response.json()) as {
        snapshot?: { metadata: AdminPostMetadata; content: string; savedAt: string } | null;
      };
      if (!active) return;
      const snapshot = data.snapshot;
      if (!snapshot) return;
      const normalizedSnapshotContent = normalizeEditorMarkdown(snapshot.content);
      const snapshotKey = JSON.stringify({
        title: snapshot.metadata.title,
        slug: post.slug,
        date: snapshot.metadata.date,
        description: snapshot.metadata.description,
        tags: snapshot.metadata.tags.join(", "),
        cover: snapshot.metadata.cover ?? "",
        content: normalizedSnapshotContent,
      });
      if (snapshotKey === initialFingerprint) return;

      const shouldRestore = window.confirm(
        `Found autosave from ${new Date(snapshot.savedAt).toLocaleString()}. Restore it?`
      );
      if (!shouldRestore) return;

      setTitle(snapshot.metadata.title);
      setDate(snapshot.metadata.date);
      setDescription(snapshot.metadata.description);
      setTags(snapshot.metadata.tags.join(", "));
      setCover(snapshot.metadata.cover ?? "");
      setContent(normalizedSnapshotContent);
      editorRef.current?.setValue(normalizedSnapshotContent);
      setAutosaveAt(snapshot.savedAt);
    })();
    return () => {
      active = false;
    };
  }, [post.slug, initialFingerprint]);

  useEffect(() => {
    if (!hydratedOnceRef.current) {
      hydratedOnceRef.current = true;
      return;
    }
    const timer = setTimeout(async () => {
      setAutosaveStatus("saving");
      try {
        const metadata = createMetadata({
          title,
          date,
          description,
          tags,
          cover,
          published: post.metadata.published,
        });
        const response = await fetch(`/admin/api/posts/${encodeURIComponent(post.slug)}/autosave`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ metadata, content }),
        });
        if (!response.ok) {
          throw new Error("Autosave failed");
        }
        const now = new Date().toISOString();
        setAutosaveStatus("saved");
        setAutosaveAt(now);
      } catch {
        setAutosaveStatus("error");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [title, date, description, tags, cover, content, post.slug, post.metadata.published]);

  async function uploadFileToPost(file: File) {
    const formData = new FormData();
    formData.set("file", file);
    const response = await fetch(`/admin/api/posts/${encodeURIComponent(post.slug)}/images`, {
      method: "POST",
      body: formData,
    });
    const data = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !data.url) {
      throw new Error(data.error || "Upload failed");
    }
    return data.url;
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (list.length === 0) return;

    setUploadError(null);
    try {
      for (const file of list) {
        const url = await uploadFileToPost(file);
        insertEditorSnippet(`![](${url})\n`);
      }
      await loadAssets();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Image upload failed.");
    }
  }

  async function handleDeleteAsset(name: string) {
    await fetch(`/admin/api/posts/${encodeURIComponent(post.slug)}/images`, {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const next = normalizeEditorMarkdown(
      (editorRef.current?.getValue() ?? "").replaceAll(`/posts/${post.slug}/${name}`, "")
    );
    editorRef.current?.setValue(next);
    setContent(next);
    await loadAssets();
  }

  async function handleRenameAsset(oldName: string) {
    const proposed = window.prompt("New image file name", oldName);
    if (!proposed || proposed === oldName) return;
    const response = await fetch(`/admin/api/posts/${encodeURIComponent(post.slug)}/images`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ oldName, newName: proposed }),
    });
    if (!response.ok) return;
    const data = (await response.json()) as { oldUrl: string; newUrl: string };
    const next = normalizeEditorMarkdown(
      (editorRef.current?.getValue() ?? "").replaceAll(data.oldUrl, data.newUrl)
    );
    editorRef.current?.setValue(next);
    setContent(next);
    await loadAssets();
  }

  function runCommand(command: SlashCommand) {
    editorRef.current?.focus();
    insertEditorSnippet(command.snippet);
    setIsCommandOpen(false);
    setCommandQuery("");
  }

  return (
    <form action={formAction} className="flex min-h-[calc(100vh-10rem)] flex-col">
      <input type="hidden" name="original_slug" value={post.slug} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="tags" value={tags} />
      <input type="hidden" name="cover" value={cover} />
      <input type="hidden" name="content" value={content} />

      <div className="sticky top-0 z-20 mb-4 border border-border/70 bg-background/85 p-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            Studio / {post.slug}
            {hasUnsavedChanges ? " / Unsaved" : " / Saved"}
            {" / "}
            {autosaveStatus === "saving" ? "Autosaving..." : ""}
            {autosaveStatus === "saved" && autosaveAt
              ? `Autosaved ${new Date(autosaveAt).toLocaleTimeString()}`
              : ""}
            {autosaveStatus === "error" ? "Autosave failed" : ""}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCommandOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground transition hover:border-primary/40 hover:text-primary"
            >
              <Command size={12} />
              /
            </button>
            <ActionButton intent="draft" label="Save Draft" icon={<Save size={12} />} />
            <ActionButton intent="publish" label="Publish" icon={<Send size={12} />} />
          </div>
        </div>
        {state.error ? (
          <p className="mt-2 text-xs font-mono uppercase text-amber-400">{state.error}</p>
        ) : null}
        {uploadError ? (
          <p className="mt-2 text-xs font-mono uppercase text-amber-400">{uploadError}</p>
        ) : null}
      </div>

      <div className="grid flex-1 gap-4 xl:grid-cols-2">
        <section className="relative flex min-h-0 flex-col border border-border/70 bg-background/40 p-4">
          {isCommandOpen ? (
            <div className="absolute inset-x-6 top-24 z-30 border border-border/70 bg-background/95 p-3 shadow-lg backdrop-blur-md">
              <div className="mb-2 flex items-center gap-2 border border-border/60 bg-background/70 px-2 py-1">
                <Search size={12} className="text-muted-foreground" />
                <input
                  ref={commandInputRef}
                  value={commandQuery}
                  onChange={(e) => setCommandQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsCommandOpen(false);
                      setCommandQuery("");
                    }
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (filteredCommands[0]) {
                        runCommand(filteredCommands[0]);
                      }
                    }
                  }}
                  className="w-full bg-transparent text-xs outline-none"
                  placeholder="Type to filter commands..."
                />
              </div>
              <div className="max-h-56 overflow-auto space-y-1">
                {filteredCommands.map((command) => (
                  <button
                    type="button"
                    key={command.id}
                    onClick={() => runCommand(command)}
                    className="flex w-full items-center justify-between border border-border/40 bg-background/60 px-2 py-1.5 text-left hover:border-primary/40"
                  >
                    <span className="text-xs text-foreground">{command.label}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {command.hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            <SystemInput
              label="Title"
              name="studio_title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <SystemInput
              label="Slug"
              name="studio_slug"
              value={slug}
              spellCheck={false}
              autoComplete="off"
              onChange={(e) => setSlug(e.target.value)}
            />
            <SystemInput
              label="Date"
              name="studio_date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <SystemInput
              label="Cover_URL"
              name="studio_cover"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
            />
          </div>

          <div className="mt-3 grid gap-3">
            <SystemInput
              label="Description"
              name="studio_description"
              value={description}
              autoComplete="off"
              onChange={(e) => setDescription(e.target.value)}
            />
            <SystemInput
              label="Tags (comma separated)"
              name="studio_tags"
              value={tags}
              autoComplete="off"
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="mt-3 flex-1 min-h-0">
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Monaco Source Editor
              </label>
              <button
                type="button"
                onClick={() => filePickerRef.current?.click()}
                className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-1 text-[10px] font-mono uppercase text-muted-foreground hover:border-primary/40 hover:text-primary"
              >
                <Upload size={11} />
                Upload
              </button>
              <input
                ref={filePickerRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) void uploadFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
            <div
              className="h-[26rem] min-h-[20rem] overflow-hidden border border-border/60 bg-background/70 xl:h-[calc(100vh-24rem)] xl:max-h-[42rem]"
              onKeyDownCapture={(e) => {
                if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                  e.preventDefault();
                  setIsCommandOpen(true);
                  setCommandQuery("");
                }
              }}
              onPasteCapture={(e) => {
                const items = Array.from(e.clipboardData.items);
                const imageFiles = items
                  .filter((item) => item.type.startsWith("image/"))
                  .map((item) => item.getAsFile())
                  .filter((file): file is File => Boolean(file));
                if (imageFiles.length === 0) return;
                e.preventDefault();
                void uploadFiles(imageFiles);
              }}
              onDropCapture={(e) => {
                if (!e.dataTransfer.files?.length) return;
                e.preventDefault();
                void uploadFiles(e.dataTransfer.files);
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <PostMonacoEditor
                value={normalizeEditorMarkdown(content)}
                onMount={handleEditorDidMount}
                onChange={(next) => {
                  if (!mountedRef.current) return;
                  setContent(normalizeEditorMarkdown(next));
                }}
              />
            </div>
          </div>
        </section>

        <section className="grid min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_16rem] gap-4 border border-border/70 bg-background/30 p-4">
          <div className="flex min-h-0 min-w-0 flex-col">
            <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Live Preview {isPreviewLoading ? "(Rendering...)" : ""}
            </div>
            <div className="min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-auto border border-border/60 bg-background/80 p-6">
              {previewError ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-300">
                    <AlertTriangle size={14} />
                    <p className="text-xs font-mono uppercase tracking-[0.12em]">
                      Preview syntax error
                    </p>
                  </div>
                  <pre className="overflow-auto border border-amber-400/40 bg-amber-500/10 p-3 text-xs text-amber-100 whitespace-pre-wrap break-words">
                    {previewError}
                  </pre>
                  <button
                    type="button"
                    onClick={() => setPreviewRetryKey((key) => key + 1)}
                    className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground hover:border-primary/40 hover:text-primary"
                  >
                    Retry Preview
                  </button>
                </div>
              ) : (
                <article className="prose prose-zinc dark:prose-invert w-full min-w-0 max-w-full break-words font-quicksand prose-pre:max-w-full prose-pre:overflow-x-auto prose-code:break-words [&_*]:max-w-full [&_img]:h-auto [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto">
                  {PreviewComponent ? (
                    <PreviewComponent components={mdxComponents as Record<string, unknown>} />
                  ) : (
                    <p>Start writing to preview.</p>
                  )}
                </article>
              )}
            </div>
          </div>

          <div className="flex min-h-0 min-w-0 flex-col border border-border/60 bg-background/70 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Image Assets
              </p>
              <button
                type="button"
                onClick={() => void loadAssets()}
                className="text-[10px] font-mono uppercase text-muted-foreground hover:text-primary"
              >
                Refresh
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto space-y-2">
              {assetLoading ? (
                <p className="text-xs text-muted-foreground">Loading assets...</p>
              ) : assets.length === 0 ? (
                <p className="text-xs text-muted-foreground">No uploaded images yet.</p>
              ) : (
                assets.map((asset) => (
                  <div
                    key={asset.name}
                    className="flex items-center justify-between gap-2 border border-border/50 bg-background/60 px-2 py-1.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs text-foreground">{asset.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        {formatBytes(asset.size)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => insertEditorSnippet(`![](${asset.url})\n`)}
                        className="rounded border border-border/60 p-1 text-muted-foreground hover:text-primary"
                        aria-label={`Insert ${asset.name}`}
                      >
                        <ImageIcon size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleRenameAsset(asset.name)}
                        className="rounded border border-border/60 p-1 text-muted-foreground hover:text-primary"
                        aria-label={`Rename ${asset.name}`}
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteAsset(asset.name)}
                        className="rounded border border-border/60 p-1 text-muted-foreground hover:text-red-400"
                        aria-label={`Delete ${asset.name}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}
