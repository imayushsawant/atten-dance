# 🎓 Atten-Dance

> *Because college makes you dance for attendance.*

A sleek, dark-mode attendance tracker built for students who want to know exactly how many classes they can skip — and how many they need to attend to recover. Featuring a premium glassmorphism UI and deep analytics.

🌍 **[Live Application](https://atten-dance.ayushsawant.dev/)**

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-green?logo=postgresql)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-cyan?logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Vercel-Serverless-black?logo=vercel)

---

##  Features
###  Authentication
- **Email & Password**: Sign up or sign in with a traditional email/password flow.
- **Google OAuth**: One-click sign-in via Google for seamless onboarding.
- **Session-based Auth**: Powered by BetterAuth with secure, server-side session management.

###  Dashboard & Analytics
- **Dashboard Overview**: Overall attendance percentage (averaged across lectures & labs) and subject-wise visual progress bars with color-coded status indicators.
- **Deep Analytics**: Trend charts powered by Recharts detailing your attendance distribution, progress patterns, and habits over time.
- **Quick Actions**: One-tap navigation to log attendance, view analytics, or check safe skips.

###  Log & Track Attendance
- **Smart Input**: Mark lectures and labs as attended or skipped per day. Easily log multiple occurrences of the same subject (e.g., 2 lectures in a day) with adjustable counts. Already-marked subjects collapse to avoid clutter.
- **Calendar Integration**: Log attendance with visual cues — pre-marked dates show up right on the calendar to prevent double entries.
- **History View**: Dedicated historical timeline of your attendance, letting you review exactly what happened on past days.

###  Safe Skips & Target Planning
- **Safe Skips Calculator**: Know exactly how many lectures/labs you can still skip per subject without dropping below your minimum threshold.
- **Recovery Planner**:
  - **Status Banner**: Overall status with exact percentage deficit/surplus.
  - **"On Thin Ice" Warnings**: Alerts for subjects that are currently safe but one skip away from danger.
  - **Dynamic Combinations**: Algorithm-generated recovery paths (e.g., "Attend 3 Lectures & 2 Labs → 76.54%").
  - **Custom Target Slider**: Simulate recovery strategies for any target percentage (50–100%).

###  Attendance Predictor
- **Overall Mode**: Global simulators to test scenarios by adding skipped or attended lectures/labs and see the direct impact on your overall percentage.
- **Subject Mode**: Interactive log-attendance style interface to precisely predict how bunking or attending specific upcoming classes will affect both that subject's attendance and your overall average.
- **Live Diff**: Side-by-side comparison of current vs. predicted percentages with color-coded deltas.

###  Semester Sharing
- **Share Codes**: Generate a unique 6-character code for any semester and share it with friends.
- **One-click Import**: Friends can import your semester structure (name, subjects, threshold) using the share code — no manual setup required.
- **Import from Dashboard**: New users can import a semester right from the welcome screen, or from the semesters management page.

###  Semester & App Management
- **Semester Lifecycle**: Fully manage semesters — create, edit details, activate, deactivate, and delete them.
- **Flexible Subjects**: Setup classes with toggleable lecture/lab configurations.
- **Custom Thresholds**: Configure your required attendance threshold per semester (e.g., 75%, 80%).
- **Dark/Light Mode**: System-aware theme with manual override.

---

##  How the Math Works

**Overall Attendance** is calculated as the **average of total lecture % and total lab %** — not a flat session count. This matches how most Indian colleges weigh attendance:

```
Overall % = (Total Lecture % + Total Lab %) / 2
```

This ensures missing a lab (which happens less frequently) impacts your average significantly more than a standard lecture.

**Safe Skips:**
```
floor((attended - threshold × total) / threshold)
```

**Recovery (sessions needed to reach threshold):**
```
ceil((threshold × total - attended) / (1 - threshold))
```

**Combination Recovery** simulates adding `L` lectures and `B` labs to find all `(L, B)` pairs where the resulting average safely crosses the threshold.

---

##  Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React 19, React Router, Recharts  |
| Styling     | Tailwind CSS 4, Lucide Icons      |
| Backend     | Express 5 (Vercel Serverless)     |
| Database    | PostgreSQL (Supabase)             |
| ORM         | Drizzle ORM                       |
| Auth        | BetterAuth (Email & Google OAuth) |
| Build       | Vite 8, TypeScript 6              |
| Deployment  | Vercel                            |

---

##  Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/)

### Install & Run

```bash
# Clone the repo
git clone https://github.com/imayushsawant/atten-dance.git
cd atten-dance

# Install dependencies
pnpm install

# Setup Environment Variables (Copy .env.example to .env)
# You will need:
#   - A Supabase PostgreSQL DATABASE_URL
#   - A BETTER_AUTH_SECRET (random string)
#   - Google OAuth Client ID & Secret (for Google sign-in)
cp .env.example .env

# Push the database schema to Supabase
pnpm run db:push

# Start dev server (frontend + backend concurrently)
pnpm dev
```

The app will be available at **http://localhost:5173**.

### Available Scripts

| Command             | Description                                    |
|---------------------|------------------------------------------------|
| `pnpm dev`          | Start frontend (Vite) + backend (Express) concurrently |
| `pnpm dev:client`   | Start only the Vite frontend                   |
| `pnpm dev:server`   | Start only the Express backend                 |
| `pnpm build`        | Build the frontend for production              |
| `pnpm preview`      | Preview the production build locally           |
| `pnpm db:generate`  | Generate Drizzle ORM migrations                |
| `pnpm db:push`      | Push schema changes to the database            |
| `pnpm db:studio`    | Open Drizzle Studio (database GUI)             |

---

##  Project Structure

```
atten-dance/
├── api/                    # Vercel Serverless Function entry point
│   └── index.ts
├── server/                 # Express backend
│   ├── db/
│   │   ├── schema.ts       # Drizzle schema (auth, semesters, subjects, attendance)
│   │   ├── queries.ts      # DB queries, analytics, recovery math
│   │   └── index.ts        # Supabase PostgreSQL connection
│   ├── middleware/
│   │   └── auth.ts         # Session validation middleware
│   ├── routes/
│   │   ├── semesters.ts    # CRUD for semesters, subjects, sharing & import
│   │   ├── attendance.ts   # Attendance record management
│   │   ├── analytics.ts    # Analytics & target calculation endpoints
│   │   └── settings.ts     # Global configuration API
│   ├── auth.ts             # BetterAuth configuration (Email/Google)
│   └── index.ts            # Express server entry point
├── src/                    # React frontend
│   ├── pages/
│   │   ├── login.tsx       # Authentication (Email + Google OAuth)
│   │   ├── dashboard.tsx   # Main dashboard with overview & charts
│   │   ├── input.tsx       # Mark attendance with calendar
│   │   ├── calendar.tsx    # Monthly calendar view
│   │   ├── history.tsx     # Past attendance records tracker
│   │   ├── safe-skips.tsx  # Safe skips calculator
│   │   ├── recovery.tsx    # Recovery planner & combinations
│   │   ├── predictor.tsx   # Interactive attendance predictor
│   │   ├── analytics.tsx   # Charts & trends visualization
│   │   ├── settings.tsx    # App settings & threshold configuration
│   │   └── semesters/      # Semester management (create, edit, list, share)
│   ├── components/
│   │   ├── layout/
│   │   │   └── app-shell.tsx   # Navigation shell with sidebar & mobile nav
│   │   └── logo.tsx            # Custom SVG logo component
│   ├── lib/
│   │   ├── api.ts              # API client & TypeScript types
│   │   ├── auth-client.ts      # BetterAuth client instance
│   │   ├── theme-provider.tsx  # Dark/light theme context provider
│   │   └── utils.ts            # Utility functions (cn, etc.)
│   ├── assets/                 # Static assets (SVG logo, etc.)
│   └── main.tsx                # App entry with routing
├── drizzle/                    # Generated migrations
├── package.json
├── vite.config.ts
├── drizzle.config.ts
├── vercel.json
└── tsconfig.json
```

---

## 📝 License

MIT — do whatever you want with it. Just don't bunk too many classes.
