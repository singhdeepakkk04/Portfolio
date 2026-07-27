import { MetadataRoute } from "next";
import { DATA } from "@/data/resume";
import { getBlogPosts } from "@/data/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all blog posts from Supabase
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
