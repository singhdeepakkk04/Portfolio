import { MetadataRoute } from "next";
import { DATA } from "@/data/resume";
import { getBlogPosts } from "@/data/blog";

// Posts used to live as .mdx files in a `content/` directory, and this sitemap
// still read them with `fs.readdirSync`. That storage moved to Supabase, and
// Cloudflare Workers has no filesystem to read anyway, so the lookup silently
// returned nothing and no blog post has ever appeared in the sitemap.
//
// Reading them from Supabase is cheap now that `getBlogPosts` returns metadata
// only and no longer renders every post's markdown.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getBlogPosts();

  const postsSitemap = posts.map((post) => ({
    url: `${DATA.url}/blog/${post.slug}`,
    lastModified: new Date(post.metadata.publishedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: DATA.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${DATA.url}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${DATA.url}/recommend`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...postsSitemap,
  ];
}
