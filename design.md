# Atten-Dance — Design System & Application Guidelines

A unified editorial design system for Atten-Dance across Web Desktop, Web Mobile, and PWA.

---

## 1. Design Principles

1. **Editorial, not "SaaS dashboard."** Serif headlines + a warm paper background give it a ledger/notebook feel. Protect this across all pages and modals. Do not swap in generic sans heading fonts or loud neon gradients.
2. **Calm by default, loud only for risk.** The palette is muted greens, creams, and earthy tones. Red/terracotta appears only when something needs attention or drops below threshold. If everything is red or highlighted, nothing is.
3. **Hierarchy through type, not boxes.** Small tracked-out uppercase eyebrow (`text-muted`, tracked `0.18–0.22em`), then a serif title (`font-serif`), then content. Repeated consistently across cards, modals, and sections.
4. **One dark surface for the primary action.** In the main content area, the dark-green card (or primary CTA) is the singular filled-dark element. Secondary actions remain on paper cards.
5. **Generous whitespace, thin borders, no heavy shadows.** Flat, paper-like surfaces with 1px subtle borders (`--border-subtle`). No heavy drop shadows or glassy blurs.
6. **Mobile & PWA first-class ergonomics.** Ergonomic thumb reach, safe-area inset preservation, clean bottom navigation for core tasks, and responsive ledger tables with horizontal scroll and sticky headers.

---

## 2. Color Palette & Tokens

### Core Neutrals (Light Mode)

| Token | Hex | Usage |
|---|---|---|
| `--bg-page` | `#F3F0E8` | Main page canvas background (warm cream paper) |
| `--bg-card` | `#FBF9F5` | Primary cards, table container, inputs, modals |
| `--bg-panel` | `#EBE6DA` | Recessed container panels (e.g. Next Move panel) |
| `--bg-chip` | `#E8E4D6` | Pills, tags, inactive toggle segment, secondary chips |
| `--bg-track` | `#E9E4DC` | Empty portion of progress bars, ring tracks |
| `--border-subtle` | `#E6E1D5` | Card borders, table dividers, input borders |
| `--border-strong` | `#D9D3C4` | Focused boundaries, active outlines, gridlines |

### Brand & Sidebar

| Token | Hex | Usage |
|---|---|---|
| `--forest-900` | `#1F3329` | Primary headings, dark ink text |
| `--forest-800` | `#25392F` | Sidebar background, primary CTA card, active toggle |
| `--forest-700` | `#2F4739` | Hover state on dark surfaces, icon tile on dark CTA |
| `--sidebar-bg` | `#25392F` | Desktop & mobile drawer sidebar background |
| `--sidebar-divider` | `#3A4F43` | Hairline dividers inside the sidebar |
| `--sidebar-text` | `#D9DDD3` | Default navigation labels |
| `--sidebar-text-muted` | `#9FAC9F` | Section labels (`WORKSPACE`, `SEMESTER`), taglines |
| `--nav-active-bg` | `#EBE3D3` | Active nav item fill (light beige on dark sidebar) |
| `--nav-active-text` | `#1F3329` | Active nav item label text |
| `--accent` | `#D9663F` | 3px active-nav left edge bar, logo dot, hyphen in wordmark |

### Semantic (Status)

| Token | Hex | Meaning | Usage |
|---|---|---|---|
| `--ok` | `#7A8B6A` | Safe / Above threshold (>= 75%) | Progress bars, ring progress, positive status tags |
| `--warn` | `#D4A04A` | Warning / Near threshold (70–74.9%) | Amber alert indicators and text |
| `--risk` | `#C65F4A` | Danger / Below threshold (< 70%) | Terracotta indicators, danger alerts, at-risk stats |
| `--ok-bg` | `#E6EADF` | Safe background tint | Icon tiles behind safe skips / positive actions |
| `--risk-bg` | `#F7E4DE` | Danger background tint | Icon tiles behind warnings / at-risk counters |

### Text Colors

| Token | Hex | Usage |
|---|---|---|
| `--text-primary` | `#1F3329` | Headlines, large numbers, primary content |
| `--text-secondary` | `#5E665E` | Subtitles, descriptive paragraphs, secondary meta |
| `--text-muted` | `#8A8F85` | Eyebrow labels, table headers, axis ticks, captions |
| `--text-on-dark` | `#F3F0E8` | High-contrast text on forest/dark surfaces |

---

## 3. Dark Mode ("Notebook at Night")

Dark mode feels like the same paper ledger under ambient night lighting — deep green-black surfaces with warm cream text, not cold OLED black or washed-out gray.

### Dark Tokens

| Token | Light Hex | Dark Hex | Notes |
|---|---|---|---|
| `--bg-page` | `#F3F0E8` | `#0F1713` | Deep green-black canvas |
| `--bg-card` | `#FBF9F5` | `#16211B` | One step lighter than page canvas |
| `--bg-panel` | `#EBE6DA` | `#121C17` | Recessed container tone |
| `--bg-chip` | `#E8E4D6` | `#1F2D25` | Pills, inactive toggle, badge fills |
| `--bg-track` | `#E9E4DC` | `#26352D` | Bar and ring tracks |
| `--border-subtle` | `#E6E1D5` | `#233229` | Subtle dividers and card borders |
| `--border-strong` | `#D9D3C4` | `#33463B` | Input borders, chart lines |
| `--sidebar-bg` | `#25392F` | `#0A100D` | Darker than the page canvas |
| `--sidebar-divider` | `#3A4F43` | `#1C2A22` | Hairline separators |
| `--sidebar-text` | `#D9DDD3` | `#C9D0C4` | Default nav label |
| `--sidebar-text-muted` | `#9FAC9F` | `#7F8C80` | Section headers |
| `--nav-active-bg` | `#EBE3D3` | `#1F2D25` | Active nav fill |
| `--nav-active-text` | `#1F3329` | `#F1EDE0` | Active nav text |
| `--accent` | `#D9663F` | `#E8794F` | Lifted warm terracotta |
| `--text-primary` | `#1F3329` | `#F1EDE0` | Warm cream |
| `--text-secondary` | `#5E665E` | `#B7BFB2` | Muted cream |
| `--text-muted` | `#8A8F85` | `#7F8B80` | Micro-copy and headers |
| `--text-on-dark` | `#F3F0E8` | `#F1EDE0` | Surfaces on dark CTA |
| `--ok` | `#7A8B6A` | `#9DB38A` | Lifted sage |
| `--warn` | `#D4A04A` | `#E3B766` | Lifted warm amber |
| `--risk` | `#C65F4A` | `#E27D67` | Lifted terracotta |
| `--ok-bg` | `#E6EADF` | `#1E2E22` | Icon tile tint |
| `--risk-bg` | `#F7E4DE` | `#3A211C` | Icon tile tint |
| `--cta-bg` | `#25392F` | `#2C4236` | Lifted forest CTA |
| `--cta-text` | `#F3F0E8` | `#F1EDE0` | Cream CTA text |
| `--cta-tile` | `#2F4739` | `#3A5446` | Tile on CTA |

---

## 4. Typography & Iconography

| Role | Family | Fallback | Weights |
|---|---|---|---|
| **Display / Headings / Big Numbers** | **Source Serif 4** | Newsreader, Georgia, serif | 400 (Titles), 600 (Stats & Emphasis) |
| **UI / Body / Tables / Navigation** | **Inter** | -apple-system, system-ui, sans-serif | 400 (Body), 500 (Labels/Nav), 600 (Semibold) |
| **Iconography** | **Hugeicons (Stroke Rounded)** | `@hugeicons/react` + `@hugeicons/core-free-icons` | 1.5px consistent stroke width |

### Iconography System
- Standardized on **Hugeicons Stroke Rounded** icon family for a modern, refined editorial aesthetic.
- Centralized in `@/components/icons` with a uniform 1.5 stroke width, rounded caps, and consistent pixel grid.
- Used across all navigation items, KPI metrics, buttons, dialogs, calendars, and tables.

### Universal Type Scale

- **H1 Page Title:** 32–44px (mobile) / 44–52px (desktop), 400 weight serif, `-0.01em` tracking, `--text-primary`.
- **Card Title:** 22–28px, 400 weight serif, `--text-primary`.
- **Primary Stat Numbers:** 44–56px, 600 weight serif, `-0.02em` tracking. Unit (`%`) at 28–32px.
- **Eyebrow Label:** 11–12px, 500–600 weight sans, **0.18–0.22em tracking**, UPPERCASE, `--text-muted`.
- **Body & Descriptions:** 14–15px, 400 weight sans, 1.5 line height, `--text-secondary`.
- **Table Headers:** 11px, 600 weight sans, 0.18em tracking, UPPERCASE, `--text-muted`.
- **Table Data:** 13–14px, 400/500 sans. Numeric values tabular, status colored when below threshold.

---

## 5. Navigation & Shell Layout

### Desktop Layout (≥ 1024px)

```
┌──────────────┬─────────────────────────────────────────────────┐
│ Sidebar      │ Top Header Cluster (Title, Eyebrow, View Toggle)│
│ 260px Fixed  ├─────────────────────────────────────────────────┤
│ --sidebar-bg │ Page Content Canvas                             │
│              │ (Padding: 36px 48px, max-width fluid)           │
└──────────────┴─────────────────────────────────────────────────┘
```

#### Sidebar Architecture
- **Logo Area:** Custom SVG brand mark in `--accent` terracotta tile + wordmark **Atten-Dance** (hyphen highlighted in `--accent`), subtitle *"Attendance Ledger"* below.
- **`WORKSPACE` Section:**
  - Dashboard (`/`)
  - Log Attendance (`/input`)
  - Calendar (`/calendar`)
  - Analytics (`/analytics`)
  - Safe Skips (`/safe-skips`)
  - Recovery Plan (`/recovery`)
  - History (`/history`)
  - Attendance Predictor (`/predictor`)
  - Time Window (`/time-window`)
- **`SEMESTER` Section:**
  - Current Active Semester indicator pill.
  - Manage Semesters (`/semesters`).
- **Footer Block:**
  - User avatar with initials (`--bg-chip` fill).
  - User name & email.
  - Quick Settings shortcut (`/settings`).
  - Sign Out action.
- **Active Navigation Indicator:**
  - Rounded item with `--nav-active-bg` fill.
  - 3px solid `--accent` indicator on the exact left edge.
  - Bold label in `--nav-active-text`.

### Mobile & PWA Layout (< 1024px)
- **Top Bar:** Fixed/sticky header with safe-area top inset support. Displays the hamburger drawer trigger, Atten-Dance wordmark, active semester pill, and quick theme toggle.
- **Slide-out Drawer:** Houses the full dark forest sidebar on mobile with tap-outside dismiss and smooth transition.
- **Bottom Navigation Bar (PWA ergonomic thumb zone):**
  - Instant access to top actions:
    1. **Dashboard** (`/`)
    2. **Log** (`/input`)
    3. **Calendar** (`/calendar`)
    4. **Analytics** (`/analytics`)
    5. **More** (opens Drawer for Safe Skips, Recovery, Predictor, Settings)
  - Height: 60px + `env(safe-area-inset-bottom)`.
  - Background matches page/card with top subtle divider.

---

## 6. Page-by-Page Specifications

### 6.1 Dashboard (`/`)

#### Header Area
- **Eyebrow:** `ATTENDANCE LEDGER / [ACTIVE SEMESTER NAME]`
- **H1:** Editorial statement (e.g. *"Know where you stand."*)
- **Subtitle & Mode Pill:** Current total sessions logged across subjects + calculation method chip (e.g. `50 / 50 SPLIT` or `TOTAL SESSIONS`).
- **Target Indicator:** Target threshold percentage indicator.

#### Dashboard Layout
- **Row 1 (KPI Strip):** Completely fills the 12-column grid. Overall Attendance card spans 5 columns; remaining 7 columns host a 3-column subgrid for Safe Skips, At Risk, and Total Subjects.
- **Row 2:** Subject Performance Vertical Bar Chart (8 cols) + "Next Move" Recommended Actions Panel (4 cols).
- **Row 3:** Complete Subject Ledger Data Table.

#### Row 1: KPI Strip (Full-Grid Fill)
1. **Overall Attendance Card (`lg:col-span-5`):**
   - Eyebrow: `OVERALL ATTENDANCE`
   - Big serif percentage (e.g., `77.7%`).
   - Caption: Clarifies calculation method (e.g., *"Weighted: 50% lectures + 50% labs"* or *"Raw attendance across all sessions"*).
   - Sub-metrics row: `LECTURES [attended]/[total]   LABS [attended]/[total]`.
   - Right visual: Circular Ring Chart (106px diameter, 12px stroke) with center percentage and `CURRENT POSITION` label.
2. **Secondary Subgrid (`lg:col-span-7`, 3 equal columns `grid-cols-1 sm:grid-cols-3`):**
   - **Safe Skips Card:**
     - Eyebrow: `SAFE SKIPS`
     - Big serif number (safe skips count or `∞`).
     - Caption: *"Sessions you can safely miss"*.
     - Icon: `--ok-bg` tile with sage shield glyph.
   - **At Risk Card:**
     - Eyebrow: `AT RISK`
     - Big serif number in terracotta `--risk` (or `--ok` if 0).
     - Caption: *"Subjects below target threshold"*.
     - Icon: `--risk-bg` tile with terracotta alert glyph.
   - **Total Subjects Card:**
     - Eyebrow: `TOTAL SUBJECTS`
     - Big serif number in `--text-primary`.
     - Caption: *"Registered this semester"*.
     - Icon: Neutral tile with book glyph.

#### Row 2: Vertical Bar Chart & "Next Move" Panel
- **Subject-by-Subject Vertical Bar Chart (`lg:col-span-8`):**
  - Responsive vertical bar chart built with Recharts `BarChart`.
  - Automatically distributes and sizes bars based on subject count with `maxBarSize={44}`, eliminating awkward gaps whether 3 or 10 subjects are registered.
  - X-Axis displays subject names (with full name in themed tooltip).
  - Y-Axis scaled 0% - 100% with light subtle grid lines.
  - Dashed horizontal ReferenceLine at the semester target threshold (e.g. 75%).
  - Color-coded bars: Sage (`--ok`) for $\ge$ target, Ochre (`--warn`) for near target, Terracotta (`--risk`) for below target.
  - Header legend and footer link to full analytics.
- **"Next Move" Panel (`lg:col-span-4`):**
  - Recessed container (`--bg-panel`) with 28px padding.
  - Eyebrow: `NEXT MOVE`
  - Title: *"Recommended next actions"*
  - Stack of 3 action cards (12px gap):
    1. **Primary Action Card (`--cta-bg`):**
       - **Action:** Log Attendance (`/input`).
       - **Data/Copy:** Shows dynamic status (e.g. *"Log today's attendance"* or *"Keep your records up to date"*).
       - **Styling:** Dark forest surface, text on dark, `--cta-tile` with pen glyph, cream chevron.
    2. **Secondary Card 1 (`--bg-card`):**
       - **Action:** Safe Skips (`/safe-skips`).
       - **Data/Copy:** Derived from `analytics.overall.safeSkips` (e.g. *"You have N safe skips available"* or *"Plan your upcoming schedule"*).
       - **Styling:** Paper card, `--border-subtle`, sage icon tile, muted chevron.
    3. **Secondary Card 2 (`--bg-card`):**
       - **Action:** Recovery Plan (`/recovery`).
       - **Data/Copy:** Derived from `subjectsBelow` count (e.g. *"N subjects below target"* or *"All subjects above target"*).
       - **Styling:** Paper card, terracotta icon tile if at risk / sage if safe, muted chevron.

#### Row 3: Subject Ledger Table
- Columns: `SUBJECT` · `OVERALL %` · `LECTURES` · `LABS`.
- Header: Tracked uppercase 11px muted text.
- Row: 42px height, 1px bottom border (`--border-subtle`), subtle hover row tint.
- Lectures / Labs breakdown: attended / total in dark text with percentage in muted, turning terracotta only if below threshold. Em dash `—` for empty categories.

---

### 6.2 Secondary Pages Guidelines

All secondary pages adhere to the same editorial design tokens:
1. **Header Pattern:** Eyebrow (e.g., `WORKSPACE / SAFE SKIPS`), serif title (e.g., *"Safe Skips Calculator"*), subtitle with contextual metadata.
2. **Log Attendance (`/input`):**
   - Clean date picker with previous/next arrows and calendar toggle.
   - Subject entry cards: clean paper card with subject name, type tag (Lecture / Lab), and 3 distinct segmented buttons: `Attended` (sage), `Skipped` (terracotta), `No Class` (neutral).
   - Already-logged records table with drag re-ordering and note indicator.
3. **Calendar (`/calendar`):**
   - Ledger calendar grid with day cells on `--bg-card`.
   - Small status dots indicating attended/skipped/holiday.
   - Day inspection drawer/card showing sessions logged on that date.
4. **Analytics (`/analytics`):**
   - Overall stats cards, attendance distribution breakdown, session timeline line chart, and lecture vs lab split comparisons using `--ok`, `--warn`, and `--risk` palette.
5. **Safe Skips (`/safe-skips`) & Recovery (`/recovery`):**
   - Individual subject cards with current percentage, safe skips / classes needed to recover to target, and interactive slider or goal simulator.
6. **Predictor & Time Window (`/predictor`, `/time-window`):**
   - Editorial form inputs (`--bg-card`, `--border-subtle`, focus with `--border-strong`).
   - Outcome projections in serif typography with clear threshold indicators.
7. **Semesters (`/semesters`, `/semesters/new`, `/semesters/:id/edit`):**
   - Active semester highlight card with badge.
   - Archive and edit semester forms styled as clean paper documents.
8. **Settings (`/settings`):**
   - Minimalist ledger preferences: Theme selector (Light / Dark / System), Target threshold slider, Data export & backup.
9. **Login (`/login`):**
   - Warm paper layout with bookish typography, clean auth card, and no loud neon glows.

---

## 7. Modals & Dialogs

- Backdrop: Subtle dark veil (`rgba(15, 23, 19, 0.6)` in light, `rgba(0, 0, 0, 0.7)` in dark) with light blur.
- Container: Paper card `--bg-card`, 1px `--border-subtle`, 12px radius, no heavy drop shadow.
- Header: Tracked uppercase eyebrow, serif modal title.
- Actions: Primary button in `--forest-800` (cream text) or secondary outlined button (`--border-strong`).
