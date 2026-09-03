# Padhai (पढाइ) — Nepal-First Digital Education Platform

<p align="center">
  <img src="https://raw.githubusercontent.com/sonusah88/Padhai-Platform/main/public/manifest.json" alt="Padhai Logo" width="80" height="80" style="border-radius: 16px;" />
</p>

<p align="center">
  <strong>Learn → Practice → Compete → Improve → Build Skills → Become Future Ready</strong>
</p>

<p align="center">
  <em>Quality learning should not depend on where you were born.</em>
</p>

---

## 🇳🇵 Vision & Philosophy

**Padhai (पढाइ)** is a production-grade, Nepal-first digital learning platform designed to make high-quality education accessible to students throughout Nepal — especially students from underserved communities with limited access to qualified teachers, modern learning resources, reliable internet, or high-end devices.

It is **not** a generic LMS. It combines:

* 📺 **Live Interactive Classes** — Evening broadcasts (7:00 PM NPT default) with live Q&A, polls, and downloadable notes.
* 📚 **Nepal NEB Curriculum Support** — School Foundation (Grade 1–10), SEE Preparation, and +2 Science/Management/Humanities streams.
* 🚀 **Future Skills Academy** — AI literacy (ChatGPT, Gemini, prompt engineering), Coding (HTML/CSS/JS, Python, Web Dev), and Digital Productivity.
* 🌐 **Language Academy** — English speaking confidence, IELTS preparation, and German language modules.
* ⚡ **Low-Bandwidth & Data Saver Mode** — 144p–720p adaptive streaming, compressed assets, lazy loading, and offline PWA capability for weak 3G/4G connections.
* 🤖 **AI Tutor (Padhai AI)** — Step-by-step hint-first learning assistant using Google Gemini (never just dumps homework answers).
* 🏆 **Competitive Learning** — Daily challenges, weekly subject tournaments, and improvement-based rankings.
* 🛡️ **Parental Visibility** — Simple, understandable dashboard for parents to monitor learning consistency, attendance, and test scores.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling & System** | [Tailwind CSS v4](https://tailwindcss.com/) + Custom HSL Tokens |
| **Components** | [shadcn/ui](https://ui.shadcn.com/) + Radix UI Primitives |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) (prefers-reduced-motion aware) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL + RLS + Auth) |
| **Localization** | [next-intl](https://next-intl-docs.vercel.app/) (English & Devanagari Nepali `ne-NP`) |
| **AI Engine** | Provider Abstraction (Google Gemini 2.0 Flash) |
| **Video Infrastructure** | Provider Abstraction (Cloudflare Stream / HLS Adaptive Bitrate) |
| **PWA** | Web App Manifest + Offline Shell Service Worker |

---

## 📁 Repository Structure

```
Padhai-Platform/
├── src/
│   ├── app/                    # Next.js App Router routes
│   │   ├── (auth)/             # Login, Register, Forgot Password
│   │   ├── (public)/           # Homepage, Courses, About, FAQ
│   │   ├── dashboard/          # Student Dashboard
│   │   ├── courses/            # Course Catalog & Detail
│   │   ├── live/               # Live Classroom & Schedule
│   │   ├── practice/           # Adaptive Quiz Engine
│   │   ├── competitions/       # Tournaments & Leaderboards
│   │   ├── ai-tutor/           # AI Assistant Interface
│   │   ├── layout.tsx          # Root Layout & i18n/Theme Providers
│   │   └── globals.css         # Padhai Design Tokens & Data Saver CSS
│   ├── components/
│   │   ├── home/               # Homepage Sections (Hero, Pathways, etc.)
│   │   ├── layout/             # Header, Footer, Bottom Nav
│   │   └── providers/          # ThemeProvider, BandwidthProvider
│   ├── i18n/                   # next-intl configuration
│   ├── messages/               # Translation files (en.json, ne.json)
│   ├── lib/
│   │   ├── providers/          # AI & Video provider abstractions
│   │   ├── supabase/           # Supabase client (Browser & Server SSR)
│   │   ├── types.ts            # TypeScript definitions (30+ DB entities)
│   │   └── utils.ts            # Nepal date/time/currency formatters
│   └── middleware.ts           # Session refresh & route protection
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Complete PostgreSQL DDL & RLS policies
├── public/                     # PWA Manifest, robots.txt, icons
├── .env.example                # Environment variables template
├── next.config.ts              # Next.js & next-intl configuration
└── package.json
```

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 20.x or later
- npm or pnpm
- Supabase account (or local PostgreSQL)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/sonusah88/Padhai-Platform.git
cd Padhai-Platform
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your configuration:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Provider (Gemini)
GEMINI_API_KEY=your-gemini-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Padhai
```

### 4. Database Setup

Apply the database schema in `supabase/migrations/001_initial_schema.sql` via Supabase SQL Editor or CLI:

```bash
npx supabase db push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Build & Verification

Run TypeScript check and production build:

```bash
# Typecheck
npx tsc --noEmit

# Production Build
npm run build

# Start Production Server
npm run start
```

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ for students across Nepal.
</p>
