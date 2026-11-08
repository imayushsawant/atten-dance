# Atten-Dance

> Attendance tracking, safe-absence calculation, and recovery planning for university students.

**Live Deployment:** [canibunk.in](https://canibunk.in)

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/imayushsawant/atten-dance)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/imayushsawant/atten-dance/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.x-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-cyan.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/ORM-Drizzle-black.svg)](https://orm.drizzle.team/)

---

## Description

Mandatory academic attendance thresholds (such as 75% or 80%) often leave students uncertain about where they stand and how an absence might affect their record. In many curriculum models, practical labs and lectures carry different weights, meaning a single missed laboratory session has a disproportionate impact that generic spreadsheets or notes apps fail to account for.

**Atten-Dance** is a full-stack web application that models real university grading structures. By evaluating lecture and laboratory percentages independently, it delivers exact mathematical insight into:
- The exact number of upcoming sessions a student can safely miss without violating minimum attendance criteria.
- Feasible recovery pathways (lecture and lab combinations) needed to regain compliance following an absence deficit.
- Projected attendance outcomes across hypothetical future schedules through interactive scenario modeling.

---

## Key Features

- **Weighted Calculation Model**: Calculates total attendance as `(Lecture % + Lab %) / 2` instead of a flat session count, accurately reflecting the higher individual weight of infrequent laboratory periods.
- **Safe Skips Calculator**: Determines how many upcoming lectures or lab sessions can be missed on a per-subject basis while remaining above the configured threshold.
- **Dynamic Recovery Planner**:
  - Identifies subjects categorized as high-risk (within one absence of falling below the requirement).
  - Computes optimal attendance combinations (e.g., *"Attend 3 Lectures and 1 Lab to reach 75.4%"*).
  - Configurable target slider for modeling recovery scenarios between 50% and 100%.
- **Interactive Predictor**: Enables students to test potential attendance scenarios at both the subject and semester levels, displaying live percentage deltas before any decisions are made.
- **Session-Based Attendance Logging**: Daily attendance marking with multi-session steppers, past-entry protection to prevent duplicate logs, and historical audit logs.
- **Curriculum Sharing via Import Codes**: Generates compact 6-character codes for sharing semester configurations (subjects, components, and thresholds) with peers.
- **Visual Analytics**: Interactive Recharts graphs detailing attendance progression and distribution patterns over time.
- **Authentication**: Built with BetterAuth, supporting secure session management via email/password credentials and Google OAuth.
- **Interface & Themes**: Responsive interface with accessible dark and light modes built on Tailwind CSS v4.

---

## Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, React Router v8, Recharts, Lucide Icons |
| **Styling** | Tailwind CSS v4, Class Variance Authority (`cva`), `clsx`, `tailwind-merge` |
| **Backend** | Node.js, Express 5, Vercel Serverless Functions |
| **Database & ORM** | PostgreSQL (Supabase), Drizzle ORM, Drizzle Kit |
| **Authentication** | BetterAuth (Session-based, Email/Password, Google OAuth) |
| **Email Service** | Resend |
| **Build & Tooling** | Vite 8, `tsx`, ESLint |

---

## Prerequisites & Installation

### Prerequisites

Verify that the following dependencies are installed locally:
- [Node.js](https://nodejs.org/) (version 20.0.0 or higher)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A running PostgreSQL database (e.g., [Supabase](https://supabase.com/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/imayushsawant/atten-dance.git
   cd atten-dance
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   # or: pnpm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Provide the required connection strings and secrets as described in the [Configuration](#configuration) section below.

4. **Synchronize database schema:**
   Push the schema definitions to your PostgreSQL instance:
   ```bash
   npm run db:push
   # or: pnpm run db:push
   ```

---

## Usage

### Local Development

Start both the Vite frontend development server and the Express backend concurrently:

```bash
npm run dev
# or: pnpm dev
```

- **Frontend client**: `http://localhost:5173`
- **Backend API server**: `http://localhost:3000`

### Available Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Runs both the client (Vite) and server (Express via `tsx`) concurrently |
| `npm run dev:client` | Starts only the Vite frontend development server |
| `npm run dev:server` | Starts only the Express API server with automatic reload |
| `npm run build` | Compiles and builds the frontend for production |
| `npm run preview` | Serves the production build locally for verification |
| `npm run db:push` | Applies Drizzle schema changes directly to the database |
| `npm run db:studio` | Launches the Drizzle Studio database administration UI |
| `npm run lint` | Executes ESLint to check for syntax and style violations |

### Workflow Overview

1. **Authentication**: Register a new account or sign in with Google.
2. **Semester Setup**: Create an active semester (e.g., *"Semester 6"*) and set your target threshold (e.g., `75%`).
3. **Subject Configuration**: Add your subjects, toggling lectures, labs, or both depending on the course syllabus.
4. **Mark Attendance**: Open the **Mark Attendance** tab each day to record attended or missed periods.
5. **Monitor & Predict**: Review the **Safe Skips** and **Recovery** tabs to plan upcoming leaves or determine how to offset missed classes.

---

## Configuration

Set the following variables in your root `.env` file:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Authentication (BetterAuth)
BETTER_AUTH_SECRET="your-generated-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
VITE_APP_URL="http://localhost:5173"

# Google OAuth (Optional for local testing)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Resend Email Delivery (Optional)
RESEND_API_KEY="re_123456789"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

---

## Contributing

Contributions from the developer community are welcome. To contribute:

1. Fork the repository.
2. Create a dedicated branch for your change:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes following conventional commit syntax:
   ```bash
   git commit -m "feat: add semester archive functionality"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request detailing the problem solved and testing steps performed.

Please run `npm run lint` and verify your build passes before submitting changes.

---

## License

This project is licensed under the [MIT License](LICENSE).
