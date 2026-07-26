<div align="center">

# 🚀 Deepak Singh — Portfolio & Next.js CMS

<p align="center">
  <b>A high-performance, aesthetically stunning Developer Portfolio & AI-ready Content Management System</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Magic_UI-5865F2?style=for-the-badge&logo=framer&logoColor=white" alt="Magic UI" />
</p>

<p align="center">
  <a href="#-key-features">Key Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-environment-variables">Environment Setup</a>
</p>

---

</div>

## 🌟 Overview

Welcome to the repository for **Deepak Singh's Personal Portfolio & Blog Platform**. 

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Magic UI**, this platform blends top-tier visual aesthetics with high-performance infrastructure. It features a custom **Supabase-backed CMS** with real-time analytics tracking, an admin post editor, automated sitemaps, interactive diagram embeds, and dynamic recommendation workflows.

---

## ✨ Key Features

- **🎨 Premium Modern Aesthetics**: Built with custom dark-mode visuals, glassmorphism, smooth animations powered by Framer Motion, and Bento grid components from Magic UI.
- **📝 Supabase CMS**: Fully persistent database-driven blog and content manager featuring draft/published states, categories, tag filtering, and live markdown processing.
- **⚡ Admin Portal & Editor**: Secure `/admin` dashboard for writing, previewing, managing blog posts, and uploading rich media/interactive diagrams seamlessly.
- **📊 Real-time Privacy-focused Analytics**: Native tracking endpoint (`/api/analytics`) and dashboard for capturing page views, visitor sessions, and content engagement without third-party bloat.
- **💡 Smart Recommendation Engine**: Interactive `/recommend` route and API endpoint delivering tailored recommendations based on user interests.
- **🔍 Automated SEO & Sitemap**: Dynamic `sitemap.ts` generation, metadata tagging, OpenGraph support, and semantic HTML5 structuring for max search indexing.
- **📱 Ultra-Responsive**: Designed mobile-first to deliver flawless performance across smartphone, tablet, and ultra-wide displays.

---

## 🛠 Tech Stack

| Domain | Technologies & Libraries |
| :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router), [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL & Service Role Client) |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/), [Magic UI](https://magicui.design/), [Shadcn UI](https://ui.shadcn.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Markdown Processing** | Unified, Remark, Rehype, Rehype Pretty Code |
| **Icons & Typography** | [Lucide React](https://lucide.dev/), Geist Sans & Mono fonts |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 📁 Project Structure

```text
portfolio/
├── src/
│   ├── app/                          # Next.js App Router Pages & APIs
│   │   ├── (blog)/                   # Blog listing & article reading pages
│   │   ├── (main)/                   # Hero, About, Experience, Projects sections
│   │   ├── admin/                    # Secure Admin Dashboard & MDX Post Editor
│   │   │   └── editor/[slug]/        # Live Post Editor
│   │   ├── api/                      # Backend API Endpoints
│   │   │   ├── admin/                # Post CRUD, analytics & upload APIs
│   │   │   ├── analytics/            # Event tracking ingest
│   │   │   └── recommendations/      # Recommendation engine route
│   │   ├── recommend/                # Recommendation Engine UI
│   │   └── sitemap.ts                # Dynamic sitemap generation
│   ├── components/                   # UI Components (Bento grid, cards, analytics)
│   ├── data/                         # Data layer (Resume JSON & Blog queries)
│   └── lib/                          # Utility wrappers, Supabase client & auth
├── scripts/                          # DB migrations & utility scripts
├── public/                           # Static assets, images & diagrams
└── ...
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the root of your project:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Portal Authentication
ADMIN_PASSWORD=your_secure_admin_password
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher
- **Package Manager**: `npm` or `pnpm`

### 1. Clone the repository
```bash
git clone https://github.com/singhdeepakkk04/Portfolio.git
cd Portfolio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the portfolio.

---

## 👨‍💻 About The Author

**Deepak Singh**  
*MBA Graduate @ IIT Roorkee | Technologist & Data Strategist*

- **LinkedIn**: [deepak-singh-iitr](https://www.linkedin.com/in/deepak-singh-iitr/)
- **GitHub**: [@singhdeepakkk04](https://github.com/singhdeepakkk04)
- **Email**: [deepaksingh4.iitr@gmail.com](mailto:deepaksingh4.iitr@gmail.com)

---

<div align="center">
  <p>Designed & Built with ❤️ by Deepak Singh</p>
</div>
