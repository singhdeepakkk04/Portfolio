import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "@shikijs/langs/bash";
import css from "@shikijs/langs/css";
import html from "@shikijs/langs/html";
import java from "@shikijs/langs/java";
import javascript from "@shikijs/langs/javascript";
import json from "@shikijs/langs/json";
import jsx from "@shikijs/langs/jsx";
import markdownLang from "@shikijs/langs/markdown";
import python from "@shikijs/langs/python";
import scala from "@shikijs/langs/scala";
import shellscript from "@shikijs/langs/shellscript";
import sql from "@shikijs/langs/sql";
import tsx from "@shikijs/langs/tsx";
import typescript from "@shikijs/langs/typescript";
import yaml from "@shikijs/langs/yaml";
import minDark from "@shikijs/themes/min-dark";
import minLight from "@shikijs/themes/min-light";
import type { Highlighter } from "shiki";
import { unified } from "unified";
import { getServiceRoleClient } from "@/lib/supabase";
import { rethrowIfNextControlFlow } from "@/lib/next-errors";

// Two separate constraints force this hand-rolled highlighter:
//
// 1. Bundle size. The full `shiki` package resolves languages and themes
//    through bundled lookup tables that drag all ~200 grammars (~8MB) into the
//    Worker regardless of what is actually used, blowing past Cloudflare's
//    3 MiB limit. Importing only the grammars this blog uses keeps it small.
//
// 2. No WASM. Shiki's default oniguruma regex engine compiles WASM from raw
//    bytes at runtime, which the Workers runtime forbids. The JavaScript regex
//    engine has no WASM dependency and works there.
//
// A code fence in a language outside this list renders unhighlighted rather
// than throwing -- rehype-pretty-code swallows the unknown-language error.
const highlighterPromise = createHighlighterCore({
  themes: [minLight, minDark],
  langs: [
    bash,
    css,
    html,
    java,
    javascript,
    json,
    jsx,
    markdownLang,
    python,
    scala,
    shellscript,
    sql,
    tsx,
    typescript,
    yaml,
  ],
  engine: createJavaScriptRegexEngine(),
});

type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
  category?: string;
  tags?: string[];
  readingTime: number;
};

type PostRow = {
  slug: string;
  title: string;
  published_at: string;
  summary: string | null;
  image: string | null;
  category: string | null;
  tags: string[] | null;
  status: string | null;
  content: string;
};

export async function markdownToHTML(markdown: string) {
  const p = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypePrettyCode, {
      // https://rehype-pretty.pages.dev/#usage
      theme: {
        light: "min-light",
        dark: "min-dark",
      },
      keepBackground: false,
      // Patched rehype-pretty-code no longer imports shiki's own
      // `getHighlighter`, so the highlighter must be supplied here. See
      // patches/rehype-pretty-code+0.13.2.patch.
      getHighlighter: () => highlighterPromise as unknown as Promise<Highlighter>,
    })
    .use(rehypeStringify)
    .process(markdown);

  return p.toString();
}

async function buildPost(row: PostRow) {
  const content = await markdownToHTML(row.content);

  // Calculate reading time
  const words = row.content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  const metadata: Metadata = {
    title: row.title || "Untitled",
    publishedAt: row.published_at || new Date().toISOString(),
    summary: row.summary || "",
    image: row.image || undefined,
    category: row.category || undefined,
    tags: row.tags || undefined,
    readingTime,
  };

  return {
    source: content,
    metadata,
    slug: row.slug,
  };
}

export async function getPost(slug: string) {
  const adminClient = getServiceRoleClient();
  if (!adminClient) return null;

  try {
    const { data, error } = await adminClient
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) return null;

    return buildPost(data as PostRow);
  } catch (e) {
    rethrowIfNextControlFlow(e);
    console.error(`[blog] Unexpected error loading post "${slug}":`, e);
    return null;
  }
}

export async function getBlogPosts() {
  const adminClient = getServiceRoleClient();
  if (!adminClient) return [];

  try {
    const { data, error } = await adminClient
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error || !data) return [];

    return await Promise.all((data as PostRow[]).map(buildPost));
  } catch (e) {
    rethrowIfNextControlFlow(e);
    console.error("[blog] Unexpected error loading posts:", e);
    return [];
  }
}
