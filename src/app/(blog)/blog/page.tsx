import BlurFade from "@/components/magicui/blur-fade";
import { getBlogPosts } from "@/data/blog";
import { BlogPosts } from "@/components/blog/blog-posts";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { DATA } from "@/data/resume";
import { Github, Linkedin, Clock, ArrowRight } from "lucide-react";
import { NewsletterForm } from "@/components/blog/newsletter-form";

export const metadata = {
  title: "Blog | The Intelligence Stack",
  description: "Insights on Engineering, Product Management, and Data.",
};

const BLUR_FADE_DELAY = 0.04;

export default async function BlogPage() {
  const posts = await getBlogPosts();

  const sortedPosts = posts.sort((a, b) => {
    if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
      return -1;
    }
    return 1;
  });

  const featuredPost = sortedPosts[0];

  return (
    <div className="w-full">

      {/* ── TITLE SECTION ── */}
      <section className="relative w-full border-b border-border/40 bg-white dark:bg-slate-950 overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative w-full max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-24 flex flex-col md:flex-row justify-between gap-10">
          <BlurFade delay={BLUR_FADE_DELAY}>
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-6">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Read the latest insights</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.05]">
                The Intelligence <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-800 dark:from-slate-300 dark:to-slate-600">Stack.</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-6 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                Thoughts on building products, engineering data systems, and leading teams.
              </p>
            </div>
          </BlurFade>
          
          <BlurFade delay={BLUR_FADE_DELAY * 2}>
            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 shrink-0 md:pt-4">
              <span className="text-xs font-semibold uppercase tracking-wider hidden sm:block">Follow on</span>
              {DATA.contact.social.GitHub && (
                <Link href={DATA.contact.social.GitHub.url} target="_blank" className="hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-900 p-2.5 rounded-full border border-slate-200 dark:border-slate-800">
                  <Github className="size-4" />
                </Link>
              )}
              {DATA.contact.social.LinkedIn && (
                <Link href={DATA.contact.social.LinkedIn.url} target="_blank" className="hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-900 p-2.5 rounded-full border border-slate-200 dark:border-slate-800">
                  <Linkedin className="size-4" />
                </Link>
              )}
              <Link href="https://www.reddit.com/" target="_blank" className="hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-900 p-2.5 rounded-full border border-slate-200 dark:border-slate-800">
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.238 15.348c.085.084.085.221 0 .306-.465.462-1.194.687-2.231.687l-.008-.002-.008.002c-1.036 0-1.766-.225-2.231-.688-.085-.084-.085-.221 0-.305.084-.084.222-.084.307 0 .379.377 1.008.561 1.924.561l.008.002.008-.002c.915 0 1.544-.184 1.924-.561.085-.084.223-.084.307 0zm-3.44-2.418c0-.507-.414-.919-.922-.919-.509 0-.922.412-.922.919 0 .508.413.919.922.919.508 0 .922-.411.922-.919zm4.04-.919c-.509 0-.922.412-.922.919 0 .508.413.919.922.919.508 0 .922-.411.922-.919 0-.507-.414-.919-.922-.919zM12 2C6.477 2 2 6.477 2 12c0 5.522 4.477 10 10 10s10-4.478 10-10c0-5.523-4.477-10-10-10zm5.636 11.869c.015.106.023.214.023.323 0 2.379-2.775 4.31-6.195 4.31-3.42 0-6.195-1.931-6.195-4.31 0-.109.008-.217.023-.323a1.273 1.273 0 01-.534-1.035c0-.702.572-1.273 1.274-1.273.343 0 .654.139.879.363 1.31-.946 3.114-1.554 5.116-1.624l.856-4.03a.279.279 0 01.332-.221l2.906.617a.939.939 0 011.773.448.94.94 0 01-.939.939.94.94 0 01-.905-.697l-2.582-.548-.755 3.556c1.974.081 3.753.689 5.047 1.626.224-.224.536-.363.879-.363.702 0 1.274.571 1.274 1.273 0 .429-.214.808-.534 1.035z"/>
                </svg>
              </Link>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* ── FEATURED POST ── */}
      <section className="w-full max-w-[1400px] mx-auto px-6 md:px-10 py-10 md:py-14">
        {featuredPost && (
          <BlurFade delay={BLUR_FADE_DELAY * 3}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Image */}
              <Link href={`/blog/${featuredPost.slug}`} className="group relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-muted">
                {featuredPost.metadata.image ? (
                  <img
                    src={featuredPost.metadata.image}
                    alt={featuredPost.metadata.title}
                    className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-700/40 via-slate-800/20 to-muted flex items-end p-8">
                    <span className="text-4xl md:text-5xl font-extrabold text-foreground/70 leading-tight">
                      {featuredPost.metadata.title}
                    </span>
                  </div>
                )}
              </Link>

              {/* Content */}
              <div className="flex flex-col justify-center space-y-5">
                {featuredPost.metadata.category && (
                  <span className="text-xs font-bold tracking-[0.15em] uppercase text-slate-600 dark:text-slate-400">
                    {featuredPost.metadata.category}
                  </span>
                )}
                <Link href={`/blog/${featuredPost.slug}`} className="group">
                  <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors leading-[1.15]">
                    {featuredPost.metadata.title}
                  </h2>
                </Link>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed line-clamp-3">
                  {featuredPost.metadata.summary}
                </p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    {featuredPost.metadata.readingTime} min read
                  </span>
                </div>
                <div className="pt-1">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    Read article
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </BlurFade>
        )}
      </section>

      {/* Divider */}
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="border-t border-border/40" />
      </div>

      {/* ── LATEST ARTICLES GRID ── */}
      <section className="w-full max-w-[1400px] mx-auto px-6 md:px-10 py-10 md:py-14 space-y-10">
        <BlurFade delay={BLUR_FADE_DELAY * 4}>
          <BlogPosts posts={sortedPosts} />
        </BlurFade>
      </section>

      {/* ── NEWSLETTER SUBSCRIBE ── */}
      <section className="w-full border-t border-border/40 bg-slate-900 dark:bg-slate-950">
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-20">
          <BlurFade delay={BLUR_FADE_DELAY * 5}>
            <NewsletterForm />
          </BlurFade>
        </div>
      </section>
    </div>
  );
}
