import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";

export interface ResumeData {
  name: string;
  initials: string;
  url: string;
  location: string;
  locationLink: string;
  description: string;
  summary: string;
  avatarUrl: string;
  skillGroups: { title: string; skills: string[] }[];
  navbar: {
    href: string;
    icon: any;
    label: string;
    openInNewTab?: boolean;
  }[];
  contact: {
    email: string;
    tel: string;
    social: Record<string, {
      name: string;
      url: string;
      icon: any;
      navbar: boolean;
    }>;
  };
  work: {
    company: string;
    href: string;
    badges: string[];
    location: string;
    title: string;
    logoUrl: string;
    start: string;
    end: string;
    description: string | readonly string[];
  }[];
  leadership: {
    company: string;
    href: string;
    badges: string[];
    location: string;
    title: string;
    logoUrl: string;
    start: string;
    end: string;
    description: string | readonly string[];
  }[];
  education: {
    school: string;
    href: string;
    degree: string;
    logoUrl: string;
    start: string;
    end: string;
  }[];
  projects: {
    title: string;
    href: string;
    dates: string;
    active: boolean;
    description: string;
    technologies: string[];
    links: {
      type: string;
      href: string;
      icon: any;
    }[];
    image?: string;
    video?: string;
  }[];
  hackathons: {
    title: string;
    dates: string;
    location: string;
    description: string;
    image: string;
    mlh?: string;
    links: {
      title: string;
      icon: any;
      href: string;
    }[];
    win?: string;
    icon?: string;
  }[];
  startups: {
    company: string;
    href: string;
    badges: string[];
    location: string;
    title: string;
    logoUrl: string;
    start: string;
    end: string;
    description: string | readonly string[];
  }[];
  certifications: {
    title: string;
    issuer: string;
    date: string;
    logoUrl?: string;
    href?: string;
  }[];
}

export const DATA: ResumeData = {
  name: "Deepak Singh",
  initials: "DS",
  url: "https://portfolio.getdeeepak04.workers.dev",
  location: "Mumbai, Maharashtra",
  locationLink: "https://www.google.com/maps/place/mumbai",
  description:
    "MBA Graduate, IIT Roorkee | Technologist turned Business Leader | Open to Product Management, Strategy Consulting & Technical Leadership roles",
  summary:
    "Ask me which KPI a Head of Sales actually needs, and I will have an opinion. Ask me why the pipeline feeding it is late, and I will open the **ADF** logs. Most people pick one side of that line. I have never seen the point.\n\nThree years at **LTIMindtree** taught me the plumbing: **Azure Data Factory**, **PySpark**, Medallion architecture, roughly **100GB a day** for banking and retail clients, and **99%+ SLA** on the pipelines nobody notices until they break. Now at **MAQ Software** I work further up the stack on **AI-enabled product analytics**, turning half-formed questions from Product, Sales and Ops into numbers those teams actually move on. One of them became a plain-English interface over **Azure OpenAI**, so stakeholders stopped waiting two days in an analyst's queue.\n\nI am certified on **Twilio Segment** and as an **Azure Data Engineer**, which is the formal way of saying I can design the event taxonomy and the governance around it, then go fix the ingestion job that is dropping the events. At LTIMindtree that looked like automated validation frameworks holding **99%+ data accuracy** and cutting quality escalations by **60%**, on pipelines moving 500M+ transaction records a month.\n\nWeekends are for building. Most recently a **13-agent RAG system** that drafts Business Analyst deliverables: I interviewed practising BAs before writing a line of code, fine-tuned a **Phi-3 Mini** on real BA artefacts, and shipped it as product manager, architect and sole engineer.",
  avatarUrl: "/mee.jpg",
  skillGroups: [
    {
      title: "Data & Analytics",
      skills: ["Azure Data Factory", "Databricks", "dbt", "Fabric", "Power BI", "PySpark", "Python", "Snowflake", "SQL", "Tableau"],
    },
    {
      title: "Cloud & Engineering",
      skills: ["Airflow", "AWS", "Azure", "Docker", "Talend"],
    },
    {
      title: "Product & Strategy",
      skills: ["A/B Testing", "Agile/Scrum", "Business Analysis", "Product Analytics", "Product Design", "Roadmapping", "Stakeholder Management", "System Design", "User Research"],
    },
    {
      title: "Tools",
      skills: ["Azure DevOps", "Confluence", "Excel", "Figma", "Git", "Jira"],
    },
  ] as { title: string; skills: string[] }[],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/blog", icon: NotebookIcon, label: "Blog" },
  ],
  contact: {
    email: "deepaksingh4.iitr@gmail.com",
    tel: "+91 9167024095",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/deepaakk04/",
        icon: Icons.github,

        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/deepak-singh-iitr/",
        icon: Icons.linkedin,

        navbar: true,
      },
      // Only real, personal profiles belong here. Every entry is published in
      // the JSON-LD `sameAs` array in the root layout, which tells search
      // engines "these accounts are the same person" -- so a placeholder or
      // someone else's handle is actively harmful, not just untidy.
    },
  },

  work: [
    {
      company: "MAQ Software",
      href: "https://maqsoftware.com/",
      badges: [],
      location: "Noida, India",
      title: "AI PM",
      logoUrl: "/maq.png",
      start: "May 2026",
      end: "Present",
      description: [
        "Built and maintained **automated dashboards and BI reports for key product and revenue metrics** in Power BI - translating complex business and product questions into structured, actionable recommendations for Product, Sales, and Operations stakeholders, reducing insight TAT by **~35%** and accelerating product decision cycles by **~2 weeks**.",
        "Deployed an **AI-enabled product analytics automation platform** - scaling BI reporting output **5x without adding headcount**, compressing dashboard preparation from **4-6 hours to under 15 minutes** and saving **80+ analyst-hours** monthly.",
        "Analysed **product usage, funnel performance, retention, and feature adoption** across 3+ concurrent product initiatives - conducting user segmentation and cohort analysis to identify growth opportunities and improving analytical delivery predictability by **~40%**.",
        "Conducted **A/B testing and campaign impact measurement** across product experiments - validating analytical outputs against business requirements, lifting insight acceptance rate by **~30%** and cutting post-analysis rework TAT by **~2 weeks**.",
        "**Tools:** SQL, Power BI, Tableau, Python, Azure OpenAI, Azure DevOps, JIRA.",
      ],
    },
    {
      company: "MAQ Software",
      href: "https://maqsoftware.com/",
      badges: [],
      location: "Noida",
      title: "Technical Manager Intern",
      logoUrl: "/maq.png",
      start: "May 2025",
      end: "Jul 2025",
      description: [
        "Designed an **employee contribution scoring system** end to end - defined the star schema, authored DDL for the dimension and fact tables and set grain definitions, giving the organisation an objective measure of individual impact and cutting the performance evaluation cycle by **40%**.",
        "Ran sprint delivery for a team of **4 developers** in Azure DevOps - decomposed epics into stories, set acceptance criteria, tracked velocity and cleared blockers, while a maintained dependency map cut integration issues by **60%**.",
        "Built an end-to-end **product KPI analytics dashboard** in Power BI - conducting cohort analysis, user segmentation, and retention tracking with a star-schema data model, accelerating product evaluation cycles by **40%** across **50+ users**.",
        "Built an **AI-assisted metadata discovery framework** in Python that auto-mapped source-to-target schemas and surfaced funnel drop-off points - cutting analytical TAT by **70%** and reducing manual workflows to under **30 minutes per source**.",
        "Built a **natural language product analytics interface using Azure OpenAI** - enabling Product and Business stakeholders to query revenue dashboards in plain English, eliminating **5+ analyst-hours weekly** and reducing ad-hoc data access TAT from **2-3 business days to under 10 minutes**.",
        "**Tools:** Python, SQL, Azure DevOps, Power BI, Figma, ADO MCP, Azure OpenAI.",
      ],
    },
    {
      company: "LTIMindtree",
      href: "https://www.ltimindtree.com/",
      badges: [],
      location: "Mumbai",
      title: "Product Data Engineer",
      logoUrl: "/ltim.avif",
      start: "Jun 2021",
      end: "May 2024",
      description: [
        "Owned the ingestion and transformation backbone for banking and retail clients at **~100GB daily** - **ADF** pipelines landing REST API, SFTP and relational sources into **ADLS Gen2**, then **Medallion** (bronze to silver to gold) transformations in **PySpark** on **Databricks** with partitioning and schema evolution.",
        "Wrote advanced SQL against large-scale banking datasets to generate actionable insights for **15+ business stakeholders** - reducing data-to-insight lag and powering the downstream BI dashboards and revenue metric reports those teams ran on.",
        "Conducted **funnel analytics, cohort analysis, and user segmentation** on **500M+ monthly transaction records** using SQL and Python - identifying retention patterns, feature adoption signals, and growth opportunities to optimise product and campaign performance, with **99%+ pipeline SLA adherence**.",
        "Modelled dimension and fact tables for **retail POS** data driving automated sales-incentive calculation, and integrated legacy on-premise systems through **Talend** - resolving production data incidents in Jira at a **99% resolution rate**.",
        "Automated **end-to-end BI reporting pipelines for revenue, conversion, and performance metrics** - eliminating manual Excel-based reporting, cutting TAT by **80%** and saving **45+ analyst-hours per reporting month**.",
        "Held **99%+ data accuracy** across analytics pipelines with automated validation frameworks - cutting quality escalations by **~60%** and keeping product, revenue, and campaign reporting trustworthy.",
        "**Tools:** Azure Data Factory, ADLS Gen2, PySpark, Databricks, Talend, SQL, Python, Power BI, Jira.",
      ],
    },
    {
      company: "TheSmallDataStore",
      href: "https://thesmalldatastore.com/",
      badges: [],
      location: "Remote",
      title: "Data Engineer Intern",
      logoUrl: "/tsds.png",
      start: "Dec 2020",
      end: "May 2021",
      description: [
        "Built the **Universal Item Master** from an empty database - designed the schema and ER model, then wrote the Python scrapers that populated it from client store catalogues.",
        "Owned the data architecture and business flow end to end as the only data engineer on the build, including the technology choices behind it.",
        "Automated catalogue ingestion from client stores with an **ELT framework**, replacing the manual upload process the product had been running on.",
        "Wrote the Python back end and managed storage on **MongoDB**.",
      ],
    },
    {
      company: "Cloud Counselage Pvt. Ltd.",
      href: "https://www.cloudcounselage.com/",
      badges: [],
      location: "Remote",
      title: "Technical Intern",
      logoUrl: "/cc.jpeg",
      start: "Mar 2020",
      end: "Jun 2020",
      description: [
        "Integrated **Citrix** collaboration tooling into the delivery workflow, increasing issue resolution speed by **50%**.",
        "Implemented a **convolutional neural network** in TensorFlow 2.0 for a colour recognition task.",
        "Contributed to the algorithms behind a **recommendation system** as a shadow ML engineer.",
        "Recognised as **best intern** with a Letter of Appreciation, for the work and for bringing peers up to speed.",
      ],
    },
  ],
  leadership: [
    {
      company: "Indian Institute of Technology, Roorkee",
      href: "https://doms.iitr.ac.in/",
      badges: [],
      location: "Roorkee, India",
      title: "Placement Cell Coordinator",
      logoUrl: "/iitr.svg",
      start: "Jul 2024",
      end: "May 2026",
      description: [
        "Led a cross-functional team to completely digitize and overhaul the centralized placement process for IIT Roorkee MBA.",
        "Spearheaded corporate relations and outreach, successfully onboarding multiple new brands and recruiters for campus placements.",
        "Conceptualized and directed the development of a centralized Placement Portal with Role-Based Access Control (RBAC), replacing fragmented Google Forms.",
        "Mentored junior coordinators and streamlined administrative operations, reducing manual verification time and overhead by over 60%.",
        "Fostered strong industry-academia partnerships, hosting pre-placement talks and leadership sessions to boost student employability.",
      ],
    },
  ],
  education: [
    {
      school: "Indian Institute of Technology, Roorkee",
      href: "https://doms.iitr.ac.in/",
      degree: "M.B.A.",
      logoUrl: "/iitr.svg",
      start: "2024",
      end: "2026",
    },
    {
      school: "Lokmanya Tilak College of Engineering (Mumbai University)",
      href: "https://ltce.in",
      degree: "B. Tech (CSE)",
      logoUrl: "/ltce.jpg",
      start: "2017",
      end: "2021",
    },

  ],
  projects: [
    {
      title: "RAGify",
      href: "https://github.com/bdayceleb/raga",
      dates: "Jan 2026 - Mar 2026",
      active: true,
      description:
        "An enterprise-grade GenAI orchestration platform with multi-tenant isolation, hybrid semantic + keyword search, anti-hallucination guardrails, and model-agnostic routing for cost-optimized inference.",
      technologies: [
        "Next.js",
        "Typescript",
        "PostgreSQL",
        "Supabase",
        "LangChain",
        "OpenAI API",
        "TailwindCSS",
        "Shadcn UI",
      ],
      links: [],
      image: "/ragify.svg",
      video: "",
    },
    {
      title: "Prasnah Kosa — Market Research Platform",
      href: "https://www.thesmalldatastore.com/prasnah",
      dates: "2021",
      active: true,
      description:
        "Identified a gap for affordable, localized survey tools in India and built a full-stack survey intelligence platform from scratch. Featuring regional language support and demographic targeting, the product was successfully sold to an incumbent market research firm (TheSmallDataStore) — validating the end-to-end business case from market gap analysis to product delivery.",
      technologies: ["Python", "Django", "PostgreSQL", "Railway", "REST API"],
      links: [
        {
          type: "Website",
          href: "https://www.thesmalldatastore.com/prasnah",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Live Product",
          href: "https://prasnah-kosa-production.up.railway.app/login",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "/prasnah.png",
      video: "",
    },
  ],
  hackathons: [
    {
      title: "Consulting Knights",
      dates: "2024",
      location: "IIM Kashipur",
      description:
        "Secured 1st Runner-up in the National Case Study Competition organized by IIM Kashipur. Demonstrated strategic thinking and problem-solving skills in a high-pressure environment.",
      image:
        "/iim-kashipur.jpg",
      links: [
        {
          title: "Contest Details",
          icon: <Icons.globe className="h-4 w-4" />,
          href: "https://unstop.com/competitions/consulting-knights-iim-kashipur-1325296",
        },
      ],
    },
    {
      title: "Aventura",
      dates: "2024",
      location: "IIM Lucknow",
      description:
        "Achieved 1st Runner Up in the National Business Plan Competition organized by Ecell, IIM Lucknow. Developed a comprehensive business strategy and financial model.",
      image:
        "/iim-lucknow.png",
      links: [
        {
          title: "Contest Details",
          icon: <Icons.globe className="h-4 w-4" />,
          href: "https://unstop.com/competitions/aventura-2025-national-business-plan-competition-iim-lucknow-1362431",
        },
      ],
    },
    {
      title: "Trendsetter",
      dates: "2024",
      location: "DS Group",
      description:
        "National Finalist in the prestigious Trendsetter competition organized by DS Group. Competed against top B-school teams across the country.",
      image:
        "/ds.webp",
      links: [
        {
          title: "Contest Details",
          icon: <Icons.globe className="h-4 w-4" />,
          href: "https://xathon.mettl.com/account/login/TrenDSetter04",
        },
      ],
    },
    {
      title: "V-Guard Big Idea",
      dates: "2024",
      location: "V-Guard",
      description:
        "National Finalist in the V-Guard Big Idea contest. Presented innovative solutions to real-world business challenges.",
      image:
        "/vguard.jpg",
      links: [
        {
          title: "Contest Details",
          icon: <Icons.globe className="h-4 w-4" />,
          href: "https://www.vguard.in/contest/index.php/index",
        },
      ],
    },
  ],
  startups: [
    {
      company: "Prasnah Kosa",
      href: "https://www.thesmalldatastore.com/prasnah",
      badges: [],
      location: "Remote",
      title: "Founder / Builder",
      logoUrl: "/prasnah.png",
      start: "2021",
      end: "2022",
      description: [
        "Identified a gap for affordable, localized survey tools in India.",
        "Built a full-stack survey intelligence platform from scratch.",
        "Successfully sold the product to an incumbent market research firm (TheSmallDataStore)."
      ],
    }
  ],
  certifications: [
    {
      title: "Microsoft Certified: Azure Data Fundamentals",
      issuer: "Microsoft",
      date: "Dec 2022",
      logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg",
      href: "https://learn.microsoft.com/api/credentials/share/en-us/DeepakSingh-5065/EEF98E7E55824DAA?sharingId=77C7E962860A195C",
    },
    {
      title: "Microsoft Certified: Azure Data Engineer Associate",
      issuer: "Microsoft",
      date: "Feb 2023",
      logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg",
      href: "https://learn.microsoft.com/api/credentials/share/en-us/DeepakSingh-5065/67EA9F7C2A0EE0B6?sharingId=77C7E962860A195C",
    },
    {
      title: "Twilio Segment Implementation Certification",
      issuer: "Twilio Segment",
      date: "Dec 2024",
      logoUrl: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/twilio.svg",
      href: "https://verify.skilljar.com/c/57oihp277pvw",
    }
  ],
};
