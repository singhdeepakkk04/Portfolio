import { HackathonCard } from "@/components/hackathon-card";
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { ProjectCard } from "@/components/project-card";
import { ResumeCard } from "@/components/resume-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DATA } from "@/data/resume";
import Link from "next/link";
import React from "react";
import Markdown from "react-markdown";
import WordRotate from "@/components/magicui/word-rotate";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { GlobeIcon, DownloadIcon, Quote } from "lucide-react";
import RetroGrid from "@/components/magicui/retro-grid";
import HyperText from "@/components/magicui/hyper-text";
import ShimmerButton from "@/components/magicui/shimmer-button";
import { ContactForm } from "@/components/contact-form";
import { getServiceRoleClient } from "@/lib/supabase";
import { rethrowIfNextControlFlow } from "@/lib/next-errors";

// Recommendations are read live on every request. supabase-js catches Next's
// "bail out of static generation" signal internally and hands it back as a
// normal query error, so the page cannot rely on that throw propagating to opt
// itself out of prerendering -- say so explicitly instead.
export const dynamic = "force-dynamic";

const BLUR_FADE_DELAY = 0.04;

const SKILL_ICONS: Record<string, string> = {
  // Data & Analytics
  "Azure Data Factory": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azuresqldatabase/azuresqldatabase-original.svg",
  "Databricks": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/databricks.svg",
  "dbt": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/dbt.svg",
  "Fabric": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/microsoftazure.svg",
  "Power BI": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/powerbi.svg",
  "PySpark": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/apachespark/apachespark-original.svg",
  "Python": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg",
  "Snowflake": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/snowflake.svg",
  "SQL": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg",
  "Tableau": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/tableau.svg",
  // Cloud & Engineering
  "Airflow": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/apacheairflow/apacheairflow-original.svg",
  "AWS": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg",
  "Azure": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg",
  "Docker": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg",
  "Talend": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/talend.svg",
  // Tools
  "Confluence": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/confluence/confluence-original.svg",
  "Excel": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/microsoftexcel.svg",
  "Figma": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg",
  "Jira": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jira/jira-original.svg",
  // Tools (additional)
  "Git": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg",
  "Azure DevOps": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/azuredevops.svg",
};

type Recommendation = {
  id: string | number;
  content: string;
  author_name: string;
  author_title: string | null;
  author_company: string | null;
  linkedin_url: string | null;
};

// The recommendations section is a nice-to-have, not the point of the page.
// Anything that goes wrong reaching Supabase -- missing credentials, a network
// blip from the edge, a schema change -- degrades to the existing "No
// recommendations yet" empty state instead of taking the whole homepage down
// with a 500.
async function getApprovedRecommendations(): Promise<Recommendation[]> {
  const adminClient = getServiceRoleClient();
  if (!adminClient) return [];

  try {
    const { data, error } = await adminClient
      .from("recommendations")
      .select("*")
      .eq("approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[home] Failed to load recommendations:", error.message);
      return [];
    }

    return (data ?? []) as Recommendation[];
  } catch (e) {
    rethrowIfNextControlFlow(e);
    console.error("[home] Unexpected error loading recommendations:", e);
    return [];
  }
}

export default async function Page() {
  const recommendations = await getApprovedRecommendations();

  return (
    <main className="relative flex flex-col min-h-[100dvh] space-y-8">
      <RetroGrid className="fixed inset-0 -z-10" />
      <section id="hero">
        <div className="mx-auto w-full max-w-7xl space-y-8 flex flex-col justify-start relative">
          <div className="gap-10 flex flex-col md:flex-row items-center justify-center w-full">
            <div className="flex-col flex flex-1 space-y-6 md:text-left text-center items-center md:items-start">
              <div className="flex items-center gap-5">
                <span className="text-5xl font-bold tracking-tight sm:text-7xl xl:text-8xl/none">
                  Hi, I&apos;m
                </span>
                <HyperText
                  className="text-5xl font-bold tracking-tight sm:text-7xl xl:text-8xl/none text-primary"
                  text={DATA.name.split(" ")[0].toUpperCase()}
                  duration={1200}
                />
                <Avatar className="size-20 border-2 border-primary/20 bg-background md:hidden shadow-lg">
                  <AvatarImage alt={DATA.name} src={DATA.avatarUrl} />
                  <AvatarFallback>{DATA.initials}</AvatarFallback>
                </Avatar>
              </div>
              <BlurFade delay={BLUR_FADE_DELAY}>
                <div className="text-sm md:text-lg text-muted-foreground font-medium max-w-[650px] leading-relaxed text-center md:text-left">
                  {DATA.description.split(" | ").map((text, i, arr) => (
                    <React.Fragment key={text}>
                      <span className="text-foreground/80">{text.trim()}</span>
                      {i < arr.length - 1 && (
                        <span className="text-primary/40 select-none font-light mx-3">|</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </BlurFade>
              <div className="flex flex-col md:flex-row gap-6 pt-4 pb-8">
                <ContactForm
                  trigger={
                    <ShimmerButton
                      className="w-full md:w-auto px-8 h-12 text-sm lg:text-base font-medium"
                      shimmerSize="0.05em"
                      background="hsl(var(--foreground))"
                      shimmerColor="hsl(var(--background))"
                    >
                      <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:text-black lg:text-lg">
                        Get in Touch
                      </span>
                    </ShimmerButton>
                  }
                />

                <Link href="/resume.pdf" target="_blank" rel="noopener noreferrer">
                  <ShimmerButton
                    className="w-full md:w-auto px-8 h-12 text-sm lg:text-base font-medium"
                    shimmerSize="0.05em"
                    background="hsl(var(--foreground))"
                    shimmerColor="hsl(var(--background))"
                  >
                    <span className="flex items-center gap-2 whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:text-black lg:text-lg">
                      Download Resume
                      <DownloadIcon className="size-4" />
                    </span>
                  </ShimmerButton>
                </Link>
              </div>
            </div>
            <div className="hidden md:flex items-start">
              <Avatar className="size-64 md:size-72 lg:size-80 border-4 border-background/50 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-primary/25 bg-background overflow-hidden relative group rounded-full">
                <AvatarImage alt={DATA.name} src={DATA.avatarUrl} className="object-cover" />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-full"></div>
                <AvatarFallback>{DATA.initials}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </section>
      <section id="about" className="px-8 md:px-12">
        <div className="mx-auto w-full max-w-7xl">
          <BlurFade delay={BLUR_FADE_DELAY * 3}>
            <div className="flex items-center w-full mb-8">
              <div className="inline-flex items-center justify-center rounded-full bg-background border-2 border-primary/20 shadow-sm px-6 py-2 transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
                <span className="text-lg font-bold text-foreground">About Me</span>
              </div>
              <div className="ml-4 h-[2px] flex-1 bg-primary/20" />
              <div className="size-3 rounded-full border-2 border-primary/20 bg-background" />
            </div>
          </BlurFade>
          <BlurFade delay={BLUR_FADE_DELAY * 4}>
            <div className="prose max-w-full text-pretty font-sans text-lg text-muted-foreground dark:prose-invert text-justify">
              <div className="not-prose flex flex-wrap items-center gap-x-1.5 mb-4 text-lg text-muted-foreground">
                <span className="leading-tight">I am a</span>
                <WordRotate
                  className="font-bold text-foreground m-0 p-0 leading-tight"
                  words={[
                    "Technology Consultant",
                    "Product Manager",
                    "Technical Program Manager",
                    "Business Analyst",
                  ]}
                />
                <span className="leading-tight">with an <strong className="font-bold text-foreground">MBA from IIT Roorkee</strong> and deep domain expertise across <strong className="font-bold text-foreground">Banking</strong>, <strong className="font-bold text-foreground">Insurance</strong>, and <strong className="font-bold text-foreground">Life Sciences</strong>.</span>
              </div>
              <Markdown>
                {DATA.summary}
              </Markdown>
            </div>
          </BlurFade>
        </div>
      </section>
      {DATA.startups.length > 0 && (
        <section id="startups" className="px-8 md:px-12">
          <div className="mx-auto w-full max-w-7xl flex min-h-0 flex-col gap-y-3">
            <BlurFade delay={BLUR_FADE_DELAY * 6.5}>
              <div className="space-y-2">
                <div className="flex items-center w-full mb-8">
                  <div className="inline-flex items-center justify-center rounded-full bg-background border-2 border-primary/20 shadow-sm px-6 py-2 transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
                    <span className="text-lg font-bold text-foreground">Startups</span>
                  </div>
                  <div className="ml-4 h-[2px] flex-1 bg-primary/20" />
                  <div className="size-3 rounded-full border-2 border-primary/20 bg-background" />
                </div>
                <h2 className="text-3xl font-bold mb-4">What I&apos;m Building</h2>
                <p className="text-muted-foreground">
                  Startups and AI products I am building from the ground up.
                </p>
              </div>
            </BlurFade>
            {DATA.startups.map((startup, id) => (
              <BlurFade
                key={startup.company}
                delay={BLUR_FADE_DELAY * 7 + id * 0.05}
              >
                <ResumeCard
                  key={startup.company}
                  logoUrl={startup.logoUrl}
                  altText={startup.company}
                  title={startup.company}
                  subtitle={startup.title}
                  href={startup.href}
                  badges={startup.badges}
                  period={`${startup.start} - ${startup.end ?? "Present"}`}
                  description={startup.description}
                />
              </BlurFade>
            ))}
          </div>
        </section>
      )}
      <section id="work" className="px-8 md:px-12">
        <div className="mx-auto w-full max-w-7xl flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 5}>
            <div className="space-y-2">
              <div className="flex items-center w-full mb-8">
                <div className="inline-flex items-center justify-center rounded-full bg-background border-2 border-primary/20 shadow-sm px-6 py-2 transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
                  <span className="text-lg font-bold text-foreground">Work Experience</span>
                </div>
                <div className="ml-4 h-[2px] flex-1 bg-primary/20" />
                <div className="size-3 rounded-full border-2 border-primary/20 bg-background" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Professional Experience</h2>
              <p className="text-muted-foreground">
                I&apos;ve had the privilege of working with some amazing companies and teams.
              </p>
            </div>
          </BlurFade>
          {DATA.work.map((work, id) => (
            <BlurFade
              key={work.company}
              delay={BLUR_FADE_DELAY * 6 + id * 0.05}
            >
              <ResumeCard
                key={work.company}
                logoUrl={work.logoUrl}
                altText={work.company}
                title={work.company}
                subtitle={work.title}
                href={work.href}
                badges={work.badges}
                period={`${work.start} - ${work.end ?? "Present"}`}
                description={work.description}
              />
            </BlurFade>
          ))}
        </div>
      </section>
      <section id="projects" className="px-8 md:px-12">
        <div className="mx-auto w-full max-w-7xl flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 11}>
            <div className="space-y-2">
              <div className="flex items-center w-full mb-8">
                <div className="inline-flex items-center justify-center rounded-full bg-background border-2 border-primary/20 shadow-sm px-6 py-2 transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
                  <span className="text-lg font-bold text-foreground">Projects</span>
                </div>
                <div className="ml-4 h-[2px] flex-1 bg-primary/20" />
                <div className="size-3 rounded-full border-2 border-primary/20 bg-background" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Featured Projects</h2>
              <p className="text-muted-foreground">
                I&apos;ve worked on a variety of projects, from simple websites to complex web applications. Here are a few of my favorites.
              </p>
            </div>
          </BlurFade>
          <BentoGrid className="mx-auto grid-cols-1 md:grid-cols-2 gap-6">
            {DATA.projects.map((project: any, id) => (
              <BlurFade
                key={project.title}
                delay={BLUR_FADE_DELAY * 12 + id * 0.05}
              >
                <BentoCard
                  name={project.title}
                  className="h-full"
                  background={
                    project.video ? (
                      <video
                        src={project.video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 h-full w-full object-cover opacity-10 transition-all duration-300 group-hover:opacity-20"
                      />
                    ) : project.image ? (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="absolute inset-0 h-full w-full object-contain p-8 opacity-5 transition-all duration-300 group-hover:opacity-10"
                      />
                    ) : null
                  }
                  Icon={GlobeIcon}
                  description={project.description}
                  href={project.href || "#"}
                  cta={project.links?.[0]?.type || "View Project"}
                />
              </BlurFade>
            ))}
          </BentoGrid>
        </div>
      </section>
      <section id="education" className="px-8 md:px-12">
        <div className="mx-auto w-full max-w-7xl flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 7}>
            <div className="space-y-2">
              <div className="flex items-center w-full mb-8">
                <div className="inline-flex items-center justify-center rounded-full bg-background border-2 border-primary/20 shadow-sm px-6 py-2 transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
                  <span className="text-lg font-bold text-foreground">Education</span>
                </div>
                <div className="ml-4 h-[2px] flex-1 bg-primary/20" />
                <div className="size-3 rounded-full border-2 border-primary/20 bg-background" />
              </div>
              <h2 className="text-3xl font-bold mb-4">My academic journey</h2>
              <p className="text-muted-foreground">
                A strong foundation in engineering and management that drives my problem-solving approach.
              </p>
            </div>
          </BlurFade>
          {DATA.education.map((education, id) => (
            <BlurFade
              key={education.school}
              delay={BLUR_FADE_DELAY * 8 + id * 0.05}
            >
              <ResumeCard
                key={education.school}
                href={education.href}
                logoUrl={education.logoUrl}
                altText={education.school}
                title={education.school}
                subtitle={education.degree}
                period={`${education.start} - ${education.end}`}
              />
            </BlurFade>
          ))}
        </div>
      </section>
      <section id="skills" className="px-8 md:px-12">
        <div className="mx-auto w-full max-w-7xl flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 9}>
            <div className="space-y-2">
              <div className="flex items-center w-full mb-8">
                <div className="inline-flex items-center justify-center rounded-full bg-background border-2 border-primary/20 shadow-sm px-6 py-2 transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
                  <span className="text-lg font-bold text-foreground">Skills</span>
                </div>
                <div className="ml-4 h-[2px] flex-1 bg-primary/20" />
                <div className="size-3 rounded-full border-2 border-primary/20 bg-background" />
              </div>
              <h2 className="text-3xl font-bold mb-4">My technical arsenal</h2>
              <p className="text-muted-foreground">
                I constantly learn and adapt to new technologies to build better products.
              </p>
            </div>
          </BlurFade>
          <BlurFade delay={BLUR_FADE_DELAY * 10}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DATA.skillGroups.map((group) => (
                <div
                  key={group.title}
                  className="group relative rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm hover:shadow-lg hover:border-foreground/20 transition-all duration-300"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    {group.title}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.skills.map((skill) => {
                      const iconUrl = SKILL_ICONS[skill];
                      return (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/60 px-2.5 py-1 text-[13px] font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
                        >
                          {iconUrl && (
                            <img
                              src={iconUrl}
                              alt={skill}
                              className="size-4 object-contain dark:invert"
                              loading="lazy"
                            />
                          )}
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </BlurFade>
        </div>
      </section>
      <section id="leadership" className="px-8 md:px-12">
        <div className="mx-auto w-full max-w-7xl flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 8.5}>
            <div className="space-y-2">
              <div className="flex items-center w-full mb-8">
                <div className="inline-flex items-center justify-center rounded-full bg-background border-2 border-primary/20 shadow-sm px-6 py-2 transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
                  <span className="text-lg font-bold text-foreground">Leadership</span>
                </div>
                <div className="ml-4 h-[2px] flex-1 bg-primary/20" />
                <div className="size-3 rounded-full border-2 border-primary/20 bg-background" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Leadership & Extracurriculars</h2>
              <p className="text-muted-foreground">
                Positions of responsibility where I learned to lead and serve.
              </p>
            </div>
          </BlurFade>
          {DATA.leadership.map((role, id) => (
            <BlurFade
              key={role.company}
              delay={BLUR_FADE_DELAY * 9 + id * 0.05}
            >
              <ResumeCard
                key={role.company}
                logoUrl={role.logoUrl}
                altText={role.company}
                title={role.company}
                subtitle={role.title}
                href={role.href}
                badges={role.badges}
                period={`${role.start} - ${role.end ?? "Present"}`}
                description={role.description}
              />
            </BlurFade>
          ))}
        </div>
      </section>
      <section id="competitions" className="px-8 md:px-12">
        <div className="mx-auto w-full max-w-7xl flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 13}>
            <div className="space-y-2">
              <div className="flex items-center w-full mb-8">
                <div className="inline-flex items-center justify-center rounded-full bg-background border-2 border-primary/20 shadow-sm px-6 py-2 transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
                  <span className="text-lg font-bold text-foreground">Case Competitions</span>
                </div>
                <div className="ml-4 h-[2px] flex-1 bg-primary/20" />
                <div className="size-3 rounded-full border-2 border-primary/20 bg-background" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Strategic Thinking</h2>
              <p className="text-muted-foreground">
                I actively participate in national-level case competitions to sharpen my strategic thinking and problem-solving skills. Competing against top B-schools allows me to apply business acumen to real-world challenges.
              </p>
            </div>
          </BlurFade>
          <BlurFade delay={BLUR_FADE_DELAY * 14}>
            <ul className="mb-4 ml-4 divide-y divide-dashed border-l">
              {DATA.hackathons.map((project: any, id) => (
                <BlurFade
                  key={project.title + project.dates}
                  delay={BLUR_FADE_DELAY * 15 + id * 0.05}
                >
                  <HackathonCard
                    title={project.title}
                    description={project.description}
                    location={project.location}
                    dates={project.dates}
                    image={project.image}
                    links={project.links}
                  />
                </BlurFade>
              ))}
            </ul>
          </BlurFade>
        </div>
      </section>
      {DATA.certifications.length > 0 && (
        <section id="certifications" className="px-8 md:px-12">
          <div className="mx-auto w-full max-w-7xl flex min-h-0 flex-col gap-y-3">
            <BlurFade delay={BLUR_FADE_DELAY * 8.2}>
              <div className="space-y-2">
                <div className="flex items-center w-full mb-8">
                  <div className="inline-flex items-center justify-center rounded-full bg-background border-2 border-primary/20 shadow-sm px-6 py-2 transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
                    <span className="text-lg font-bold text-foreground">Certifications</span>
                  </div>
                  <div className="ml-4 h-[2px] flex-1 bg-primary/20" />
                  <div className="size-3 rounded-full border-2 border-primary/20 bg-background" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Continuous Learning</h2>
                <p className="text-muted-foreground">
                  Professional certifications and credentials.
                </p>
              </div>
            </BlurFade>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {DATA.certifications.map((cert, id) => {
                const CertContent = (
                  <div className="flex h-full items-center p-4 border rounded-xl hover:shadow-md transition-shadow bg-card/50 backdrop-blur-sm">
                    {cert.logoUrl && (
                      <div className="mr-4 flex-shrink-0">
                        <img src={cert.logoUrl} alt={cert.issuer} className={`size-10 object-contain rounded-md ${cert.logoUrl?.includes('simple-icons') ? 'dark:invert' : ''}`} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate" title={cert.title}>{cert.title}</h3>
                      <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                    </div>
                    {cert.date && (
                      <div className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                        {cert.date}
                      </div>
                    )}
                  </div>
                );
                return (
                  <BlurFade
                    key={cert.title}
                    delay={BLUR_FADE_DELAY * 8.4 + id * 0.05}
                  >
                    {cert.href ? (
                      <Link href={cert.href} target="_blank" rel="noopener noreferrer" className="block h-full">
                        {CertContent}
                      </Link>
                    ) : (
                      CertContent
                    )}
                  </BlurFade>
                );
              })}
            </div>
          </div>
        </section>
      )}

        <section id="recommendations" className="px-8 md:px-12">
          <div className="mx-auto w-full max-w-7xl">
            <BlurFade delay={BLUR_FADE_DELAY * 9}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <div className="inline-flex items-center justify-center rounded-full bg-background border-2 border-primary/20 shadow-sm px-6 py-2 transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
                    <span className="text-lg font-bold text-foreground">Recommendations</span>
                  </div>
                  <div className="ml-4 h-[2px] flex-1 bg-primary/20" />
                  <div className="size-3 rounded-full border-2 border-primary/20 bg-background" />
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                  <div>
                    <h2 className="text-3xl font-bold">What people say</h2>
                    <p className="text-muted-foreground">Testimonials from people I&apos;ve worked with.</p>
                  </div>
                  <Link href="/recommend">
                    <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
                      Write a Recommendation
                    </button>
                  </Link>
                </div>
              </div>
            </BlurFade>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
              {recommendations?.map((rec, id) => (
                <BlurFade key={rec.id} delay={BLUR_FADE_DELAY * 10 + id * 0.05}>
                  <div className="group relative p-6 border rounded-xl bg-card/50 backdrop-blur-sm hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 transition-all flex flex-col h-full">
                    <Quote className="size-8 text-primary/15 group-hover:text-primary/25 transition-colors mb-2 shrink-0" fill="currentColor" />
                    <p className="text-sm leading-relaxed text-foreground/90 mb-6 flex-1">
                      {rec.content}
                    </p>
                    <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                      <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                        {rec.author_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        {rec.linkedin_url ? (
                          <a
                            href={rec.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-foreground hover:text-blue-500 hover:underline flex items-center gap-1 truncate"
                          >
                            {rec.author_name}
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500 shrink-0"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                          </a>
                        ) : (
                          <p className="font-semibold text-foreground truncate">{rec.author_name}</p>
                        )}
                        <p className="text-xs text-muted-foreground truncate">
                          {rec.author_title}
                          {rec.author_company && ` at ${rec.author_company}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </BlurFade>
              ))}

              {!recommendations?.length && (
                <div className="col-span-full flex flex-col items-center gap-3 p-10 text-center border rounded-xl bg-muted/20 text-muted-foreground border-dashed">
                  <Quote className="size-8 text-muted-foreground/40" />
                  No recommendations yet. Be the first to write one!
                </div>
              )}
            </div>
          </div>
        </section>
      <footer id="contact" className="w-full pt-12 pb-4 border-t bg-muted/40">
        <div className="mx-auto w-full max-w-7xl px-8 md:px-12">
          <BlurFade delay={BLUR_FADE_DELAY * 16}>
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="space-y-6">
                <h2 className="text-5xl font-bold tracking-tight sm:text-6xl text-foreground pb-2 leading-tight">
                  Let&apos;s build something together.
                </h2>
                <p className="max-w-[600px] text-muted-foreground text-xl">
                  I&apos;m always open to discussing new projects, creative ideas or opportunities to be part of your visions.
                </p>
                <Link href={`mailto:${DATA.contact.email}`} className="inline-block">
                  <ShimmerButton className="shadow-2xl" background="hsl(var(--foreground))" shimmerColor="hsl(var(--background))">
                    <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:text-black lg:text-lg">
                      Say Hello 👋
                    </span>
                  </ShimmerButton>
                </Link>
              </div>

              <div className="flex flex-col justify-end space-y-8 lg:items-end">
                <div className="flex gap-4">
                  {Object.entries(DATA.contact.social)
                    .filter(([_, social]) => social.navbar)
                    .map(([name, social]) => (
                      <Link
                        key={name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex size-12 items-center justify-center rounded-full border bg-background text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:scale-110 hover:shadow-lg"
                      >
                        <social.icon className="size-5" />
                      </Link>
                    ))}
                </div>
                <p className="text-base text-muted-foreground">
                  © {new Date().getFullYear()} {DATA.name}. All rights reserved.
                </p>
              </div>
            </div>
          </BlurFade>
        </div>
      </footer>
    </main >
  );
}
