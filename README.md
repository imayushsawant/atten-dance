# 🎓 Atten-Dance

> *Because college makes you dance for attendance.*

A sleek, dark-mode attendance tracker built for students who want to know exactly how many classes they can skip — and how many they need to attend to recover. Featuring a premium glassmorphism UI and deep analytics.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?logo=typescript)
![SQLite](https://img.shields.io/badge/SQLite-local-green?logo=sqlite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-cyan?logo=tailwindcss)

---

## ✨ Features

### 🎨 Stunning UI & Design
- **Glassmorphism Theme**: Custom dark-mode interface featuring frosted glass panels and subtle dynamic glow effects.
- **Responsive Layout**: Integrated navigation shell with a custom logo that seamlessly adapts to mobile and desktop screens.

### 📊 Dashboard & Analytics
- **Dashboard Overview**: Overall attendance percentage (averaged across lectures & labs) and subject-wise visual progress bars.
- **Deep Analytics**: Trend charts powered by Recharts detailing your attendance distribution, progress patterns, and habits over time.

### 📅 Log & Track Attendance
- **Smart Input**: Mark lectures and labs as attended or skipped per day. Already-marked subjects collapse to avoid clutter.
- **Calendar Integration**: Log attendance with visual cues — pre-marked dates show up right on the calendar to prevent double entries.
- **History View**: Dedicated historical timeline of your attendance, letting you review exactly what happened on past days.

### 🛡️ Safe Skips & Target Planning
- **Safe Skips Calculator**: Know exactly how many lectures/labs you can still skip per subject without dropping below your minimum threshold.
- **Recovery Planner**:
  - **Status Banner**: Overall status with exact percentage deficit/surplus.
  - **"On Thin Ice" Warnings**: Alerts for subjects that are currently safe but one skip away from danger.
  - **Dynamic Combinations**: Algorithm-generated recovery paths (e.g., "Attend 3 Lectures & 2 Labs → 76.54%").
  - **Custom Target Slider**: Simulate recovery strategies for any target percentage (50–100%).

### ⚙️ Semester & App Management
- **Semester Lifecycle**: Fully manage semesters — create, edit details, and end them when the term is over.
- **Flexible Subjects**: Setup classes with toggleable lecture/lab configurations.
- **Custom Thresholds**: Configure your required attendance threshold globally (e.g., 75%, 80%).

---

## 🧮 How the Math Works

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

## 🛠️ Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React 19, React Router, Recharts  |
| Styling     | Tailwind CSS 4, Lucide Icons      |
| Backend     | Express 5, TypeScript             |
| Database    | SQLite via better-sqlite3         |
| ORM         | Drizzle ORM                       |
| Build       | Vite 8                            |
| Runtime     | Node.js                           |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/)

### Install & Run

```bash
# Clone the repo
git clone https://github.com/your-username/atten-dance.git
cd atten-dance

# Install dependencies
pnpm install

# Start dev server (frontend + backend concurrently)
pnpm dev
```

The app will be available at **http://localhost:5173**.

### Build for Production

```bash
pnpm build
pnpm preview
```

---

## 📁 Project Structure

```
atten-dance/
├── server/                 # Express backend
│   ├── db/
│   │   ├── schema.ts       # Drizzle schema (semesters, subjects, attendance)
│   │   ├── queries.ts      # DB queries, analytics, recovery math
│   │   └── index.ts        # Database connection
│   ├── routes/
│   │   ├── semesters.ts    # CRUD for semesters, subjects, and archiving
│   │   ├── attendance.ts   # Attendance record management
│   │   ├── analytics.ts    # Analytics & target calculation endpoints
│   │   └── settings.ts     # Global configuration API
│   └── index.ts            # Express server entry point
├── src/                    # React frontend
│   ├── pages/
│   │   ├── dashboard.tsx   # Main dashboard with overview
│   │   ├── input.tsx       # Mark attendance with calendar
│   │   ├── calendar.tsx    # Monthly calendar view
│   │   ├── history.tsx     # Past attendance records tracker
│   │   ├── safe-skips.tsx  # Safe skips calculator
│   │   ├── recovery.tsx    # Recovery planner & combinations
│   │   ├── analytics.tsx   # Charts & trends visualization
│   │   ├── settings.tsx    # App settings & threshold configuration
│   │   └── semesters/      # Semester management (create, edit, list)
│   ├── components/         # Reusable UI components & app shell
│   ├── lib/                # API client & TypeScript types
│   └── main.tsx            # App entry with routing
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 📝 License

MIT — do whatever you want with it. Just don't bunk too many classes.
