import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { getServiceRoleClient } from "@/lib/supabase";

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
  const { data, error } = await adminClient
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;

  return buildPost(data as PostRow);
}

export async function getBlogPosts() {
  const adminClient = getServiceRoleClient();
  const { data, error } = await adminClient
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error || !data) return [];

  return Promise.all((data as PostRow[]).map(buildPost));
}
