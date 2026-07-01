# 🎓 Atten-Dance

> *Because college makes you dance for attendance.*

A sleek, dark-mode attendance tracker built for students who want to know exactly how many classes they can skip — and how many they need to attend to recover.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?logo=typescript)
![SQLite](https://img.shields.io/badge/SQLite-local-green?logo=sqlite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-cyan?logo=tailwindcss)

---

## ✨ Features

### 📊 Dashboard
- Overall attendance percentage at a glance (averaged across lectures & labs)
- Subject-wise breakdown with visual progress bars
- Quick stats: total attended, total skipped, streak tracking

### 📅 Calendar View
- Google Calendar–style monthly view of all your lectures
- Click any date to see which subjects you attended, bunked, or didn't have that day
- Color-coded entries for instant visual feedback

### ✍️ Mark Attendance
- Mark lectures and labs as attended or skipped per day
- Add entries anytime during the day — no end-of-day restriction
- Already-marked subjects collapse to avoid clutter, with option to expand and edit

### 🛡️ Safe Skips
- Know exactly how many lectures/labs you can still skip per subject without dropping below threshold
- Subject-wise and type-wise (lecture vs lab) breakdown

### 🏥 Recovery Planner
- **Overall status banner**: Green if above threshold, red if below — with your exact percentage
- **On Thin Ice warnings**: Subjects that are above threshold but one skip away from dropping
- **Subject-wise recovery**: Exact number of consecutive lectures/labs needed per subject
- **Overall recovery**: How many lectures-only, labs-only, or mixed combinations to attend
- **Dynamic combinations**: Algorithm-generated examples like "3 Lectures & 2 Labs → 76.54%"
- **Custom target calculator**: Slider to simulate recovery to any percentage (50–100%)
- **Impossible state detection**: Tells you when recovering via only one type is mathematically impossible

### 📈 Analytics
- Trend charts with Recharts
- Attendance distribution and patterns

### ⚙️ Settings
- Configurable attendance threshold (default: 75%)
- Semester management with subject setup (lecture/lab toggles)

---

## 🧮 How the Math Works

**Overall Attendance** is calculated as the **average of total lecture % and total lab %** — not a flat session count. This matches how most Indian colleges weigh attendance:

```
Overall % = (Total Lecture % + Total Lab %) / 2
```

This means missing a lab (which happens less frequently) hurts your average significantly more than missing a lecture.

**Safe Skips:**
```
floor((attended - threshold × total) / threshold)
```

**Recovery (sessions needed to reach threshold):**
```
ceil((threshold × total - attended) / (1 - threshold))
```

**Combination Recovery** simulates adding `L` lectures and `B` labs to find all `(L, B)` pairs where the resulting average crosses the threshold.

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
│   │   ├── queries.ts      # All DB queries, analytics, recovery math
│   │   └── index.ts        # Database connection
│   ├── routes/
│   │   ├── semesters.ts    # CRUD for semesters & subjects
│   │   ├── attendance.ts   # Attendance record management
│   │   └── analytics.ts    # Analytics & target calculation endpoints
│   └── index.ts            # Express server entry point
├── src/                    # React frontend
│   ├── pages/
│   │   ├── dashboard.tsx   # Main dashboard with overview
│   │   ├── calendar.tsx    # Monthly calendar view
│   │   ├── input.tsx       # Mark attendance
│   │   ├── safe-skips.tsx  # Safe skips calculator
│   │   ├── recovery.tsx    # Recovery planner
│   │   ├── analytics.tsx   # Charts & trends
│   │   └── settings.tsx    # App settings
│   ├── components/         # Reusable UI components
│   ├── lib/
│   │   └── api.ts          # API client & TypeScript types
│   └── main.tsx            # App entry with routing
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 📝 License

MIT — do whatever you want with it. Just don't bunk too many classes.
