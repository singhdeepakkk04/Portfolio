import { MetadataRoute } from "next";
import { DATA } from "@/data/resume";
import fs from "fs";
import path from "path";

export default function sitemap(): MetadataRoute.Sitemap {
  // Get all blog posts
  const postsDirectory = path.join(process.cwd(), "content");
  let postSlugs: string[] = [];
  
  try {
    if (fs.existsSync(postsDirectory)) {
      postSlugs = fs.readdirSync(postsDirectory)
        .filter((file) => file.endsWith(".mdx"))
        .map((file) => file.replace(/\.mdx$/, ""));
    }
  } catch (e) {
    console.error("Error reading posts directory for sitemap", e);
  }

  const postsSitemap = postSlugs.map((slug) => ({
    url: `${DATA.url}/blog/${slug}`,
    lastModified: new Date(),
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
