# FoodAnalyser × Fit

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-orange?logo=jsonwebtokens)
![AI](https://img.shields.io/badge/AI-Computer_Vision-blueviolet)
![Deployment](https://img.shields.io/badge/Deployed-Vercel_&_Render-success)
![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen)
![Conference](https://img.shields.io/badge/IEEE-CCPIS_2025-blue)

## Indian Food Nutrition Intelligence & Health Scoring System

**FoodAnalyser × Fit** is a full-stack nutrition platform built for Indian diets. It combines official Indian food composition data (**IFCT 2017**, **INDB**, and Northeast regional estimates) with AI image recognition, barcode scanning, diet planning, daily tracking, recipe analysis, and health scoring.

Unlike generic calorie apps that lean on Western databases, FoodAnalyser searches Indian sources first and only falls back to global APIs when needed.

**Built for:** Indian consumers, fitness enthusiasts, dieticians, students, and nutrition research.

| Live App | API |
|----------|-----|
| [https://foodanalyserr.vercel.app](https://foodanalyserr.vercel.app) | [https://foodanalyser.onrender.com](https://foodanalyser.onrender.com) |

---

## Table of Contents

- [Overview](#overview)
- [Why FoodAnalyser Is Different](#why-foodanalyser-is-different)
- [Data Sources](#data-sources)
- [Features](#features)
- [App Pages & Routes](#app-pages--routes)
- [UX Details](#ux-details)
- [System Architecture](#system-architecture)
- [API Overview](#api-overview)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Accuracy Notes](#accuracy-notes)
- [Research & Publication](#research--publication)
- [Roadmap](#roadmap)
- [Project Structure](#project-structure)
- [Author](#author)

---

## Overview

FoodAnalyser helps people understand Indian food in context:

1. **Search** dishes and ingredients with IFCT / INDB / regional matches
2. **Browse** by state cuisine, category, or staple comparison
3. **Scan** packaged products and map them to Indian equivalents
4. **Photograph** a plate for AI-assisted identification + nutrition
5. **Plan** calorie / protein targets with Indian meal patterns
6. **Track** daily intake, water, activity, streaks, and XP
7. **Analyse** homemade recipes by ingredient list
8. **Review** the product with live Socket.io updates

Deployed on **Vercel** (frontend) + **Render** (backend) + **MongoDB Atlas**, with JWT auth for personal sync data. Research-backed (IEEE CCPIS 2025).

---

## Why FoodAnalyser Is Different

1. Built on **IFCT 2017 (ICMR–NIN)** — India’s official food composition table
2. Uses **INDB** for cooked & traditional recipes
3. Adds **Northeast regional estimates** (Assam, Manipur, Meghalaya, Nagaland) with clear trust labels
4. **AI food image recognition** (OpenAI Vision) with Indian-name preference
5. **Barcode scanning** via Open Food Facts + Indian mapping
6. **Diet plan → daily tracker** loop with cloud sync when signed in
7. **Recipe analyser**, regional cuisine pages, category browse, and staple compare tools
8. Light / dark theme, premium motion UI, cold-start friendly search loading
9. Real-time **reviews** via Socket.io
10. Deployed and research-ready

---

## Data Sources

### IFCT 2017 (ICMR–NIN)
- 500+ Indian food items (project loads ~542)
- Macro & micronutrients (energy, protein, carbs, fat, fibre, and more)
- Standardized per-100g values
- Government / research-verified composition data

### INDB (Indian Nutrient Databank)
- Cooked foods & traditional Indian recipes (~1000+)
- Serving-oriented nutrition for everyday meals
- Beverage & regional preparation coverage

### Northeast Regional Estimates
- Assam / Manipur / Meghalaya / Nagaland dishes where official tables are sparse
- Shown with explicit trust badges (“regional estimate”) so nothing is oversold

### External (Fallback / Packaged Foods)

| Source | Used for |
|--------|----------|
| **Open Food Facts** | Packaged products by barcode |
| **CalorieNinjas** | Nutrition fallback when Indian DBs have no match |
| **OpenAI Vision** | Food name identification from images |

---

## Features

### 1. Indian-Optimized Food Search (`/`)
- Vanishing-input search, popular chips, and discovery homepage
- Ranked matching: **IFCT → INDB → regional → CalorieNinjas** (fallback only)
- Autocomplete / typo-tolerant suggestions
- Result carousel with macros, source badges, portion customizer, and cooking-fat add-ons
- Regional variant chips (e.g. Assamese / Punjabi style adjustments)
- Heuristic pros / cons insights per match
- Add-to-tracker from any result plate

### 2. Discover & Browse
- **Regional cuisine pages** (`/cuisine/:slug`) — state dishes with quick analyse
- **Category browse** (`/category/:id`) — verified IFCT/INDB lists (high protein, low cal, etc.)
- **Staple compare** (`/compare`, `/compare/:familyId`) — roti, rice, dal, breakfast by region
- Featured dish, trending rails, and credibility / trust badges on home

### 3. AI Food Image Recognition (`/image`)
- Camera capture or image upload
- Sharp preprocessing before analysis
- OpenAI Vision identifies the main food (Indian names preferred)
- Nutrition resolved against IFCT when possible
- Health score (0–100) + healthier Indian alternative suggestions
- Quick-score mode + daily client upload limit

### 4. Barcode / QR Scanning (`/scan`)
- Live camera (`html5-qrcode`) or image upload
- Server-side decode (Sharp + ZXing) and Open Food Facts lookup
- Indian food equivalent mapping (IFCT / INDB)
- Health score + healthier Indian alternatives for packaged products

### 5. Health & Diet Calculator (`/calculator`)
- BMR (Mifflin–St Jeor / Katch–McArdle style)
- TDEE from activity multipliers
- Cut / bulk / recomp calorie targets and protein estimates
- Multi-week planning table
- Fully client-side (no login required)

### 6. Diet Plan (`/plan`)
- Indian meal-pattern targets wired into the tracker
- Calorie / macro goals that daily logging can follow

### 7. Daily Tracker (`/tracker`)
- Log meals from search results or quick text entry
- Daily calorie / macro totals vs plan target
- Water, activity, health score, and weekly overview
- Cloud sync when signed in (`/api/sync`)
- XP / streak / progression on **Profile** (`/profile`)

### 8. Recipe Analyser (`/recipe`)
- Paste or type ingredients for homemade dishes
- Estimated plate nutrition from Indian DB matches where possible

### 9. Authentication & Security
- Email / password signup & login
- JWT middleware for protected APIs
- Google & GitHub OAuth (popup + `postMessage` token handoff)
- Soft route protection when syncing personal tracker data
- Rate limits on costly food / calorie / image / scan routes

### 10. Reviews & About (`/review`, `/about`)
- Guest or authenticated reviews (name, rating, description)
- Paginated list + rating distribution
- Real-time create / delete via Socket.io
- About page with product story and live testimonials

---

## App Pages & Routes

| Route | Page | Access | Purpose |
|-------|------|--------|---------|
| `/` | Home + Food Search | Public | Landing, Indian search, discovery rails, results |
| `/cuisine/:slug` | Regional Cuisine | Public | Browse state dishes & analyse |
| `/category/:id` | Category Browse | Public | Verified IFCT/INDB category lists |
| `/compare` | Compare Staples | Public | Pick a staple family |
| `/compare/:familyId` | Compare Family | Public | Region-wise staple comparison |
| `/plan` | Diet Plan | Public | Indian meal targets |
| `/tracker` | Daily Tracker | Public / sync with auth | Log meals & daily macros |
| `/profile` | Profile | Public / richer with auth | XP, streaks, progression |
| `/recipe` | Recipe Analyser | Public | Ingredient → nutrition estimate |
| `/calculator` | Health Calculator | Public | BMR / TDEE / goals |
| `/scan` | Barcode Scanner | Public | Packaged food scan |
| `/image` | Image Recognition | Public | Photo → food ID + nutrition |
| `/about` | About | Public | Mission, features, testimonials |
| `/review` | Reviews | Public | Submit & browse feedback |
| `/login` | Login | Public | Email / password + OAuth |
| `/signup` | Signup | Public | Account creation + OAuth |
| `*` | 404 Not Found | Public | Immersive themed 404 |
| `/logmeals` | → `/tracker` | — | Legacy redirect |
| `/addfoods` | → `/` | — | Legacy redirect |
| `/text` | → `/` | — | Legacy redirect |
| `/history` | → `/` | — | Legacy redirect |

---

## UX Details

### Themes
- **Light / dark / system** via `ThemeProvider` (`fa-theme` in `localStorage`)
- Applied with `data-theme` on `<html>` so UI stays readable in both modes

### Search cold-start (Render free tier)
Render free web services sleep after idle time, so the first search after a long gap can take ~20–30s. The app softens that:

1. **Background warm-up** — on first page load, the client quietly pings `GET /health` so the backend starts waking while the user reads the home page
2. **Pacman loader** — if a search still takes time, a Pacman spinner appears with friendly copy:
   - “First search of the day may take a bit longer”
   - Then rotating lines like “Almost there…” / “Warming up the kitchen…”

No technical “server wake” jargon — just calm, human messaging.

### 404 page
Unknown routes render an immersive, theme-aware **404** (expanding circles + stick figures) with **Go Back** and **Go Home**.

### Motion & polish
- Framer Motion page transitions and section reveals
- Sticky compact search while viewing results
- Trust badges on sources and portion-adjusted plates
- Responsive layout (desktop + mobile nav)

---

## System Architecture

```
Frontend (React + Vite + Tailwind)          Backend (Node.js + Express)
─────────────────────────────────          ────────────────────────────
ThemeProvider (light / dark / system)
AuthContext (JWT / OAuth)          ──►     /api/auth
ReviewsContext + Socket.io         ──►     /api/reviews + Socket.io
Food Search / Discover UI          ──►     /api/food (IFCT → INDB → regional → CalorieNinjas)
Barcode Scanner                    ──►     /api/scan (ZXing + Open Food Facts)
Image Recognition UI               ──►     /api/image (OpenAI Vision + IFCT)
Daily Tracker + Profile            ──►     /api/sync (cloud meal / progress sync)
Calculator (client-side)                   /api/calories (optional server calculator)
Warm-up ping on visit              ──►     GET /health
                                           MongoDB (users, sync, reviews, …)
                                           Local JSON: IFCT + INDB + Assam datasets
```

**Deployment**
- Frontend → **Vercel**
- Backend → **Render**
- Database → **MongoDB Atlas**

---

## API Overview

| Mount | Capabilities |
|-------|----------------|
| `GET /health` | Service + MongoDB readiness (also used for client warm-up) |
| `/api/auth` | Signup, login, Google / GitHub OAuth |
| `/api/food` | Indian search, suggest, by-id, categories, health-score (rate-limited) |
| `/api/calories` | Server-side BMR / TDEE calculator (rate-limited) |
| `/api/scan` | Image barcode upload/decode, product fetch, health score |
| `/api/image` | `analyzefood`, `quick-score`, cache info |
| `/api/reviews` | Create / list / delete reviews |
| `/api/sync` | Authenticated GET / PUT for tracker & progression cloud sync |

Unknown API paths return JSON 404 from Express.

---

## Tech Stack

### Frontend
- React 19 + Vite 6 + React Router 7
- Tailwind CSS + Radix / shadcn-style UI (`src/components/ui`)
- Context API (`AuthContext`, `ReviewsContext`, `ThemeContext`)
- Framer Motion, Lucide icons
- Axios / Fetch
- `html5-qrcode` for camera barcode scanning
- Three.js / React Three Fiber (optional visual components)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT + Passport (Google, GitHub OAuth)
- OpenAI Vision API
- Sharp (image processing)
- ZXing (barcode decoding)
- Socket.io (real-time reviews)
- Multer, Morgan, CORS, dotenv
- Rate limiting on costly routes

### Data & Persistence
- `User` — accounts + OAuth identities
- `UserSync` — cloud tracker / progression payload
- `Review` — ratings & feedback
- Local JSON datasets — IFCT, INDB, Assam / regional

---

## Screenshots

### Home & Food Search
![Home](./screenshots/Homepage.png)

### Indian Food Nutrition Search
![Food Search](./screenshots/Foodsearch.png)

### AI Food Image Recognition
![Image Recognition](./screenshots/Imagerecognition.png)

### Barcode Scanning & Product Analysis
![Barcode Scanner](./screenshots/BarcodeScan.png)

### Health & Diet Calculator
![Calculator](./screenshots/CaloriesCal.png)

### Meal Logging & Tracker
![Meal Logging](./screenshots/Logmeal.png)

### Reviews & Feedback
![Reviews](./screenshots/Reviews.png)

---

## Local Setup

### Prerequisites
- Node.js 18+ (recommended)
- MongoDB connection string (Atlas or local)
- API keys for features you want to use (OpenAI, CalorieNinjas, OAuth)

### 1. Clone
```bash
git clone https://github.com/suvamneog/foodAnalyser-v2.git
cd foodAnalyser-v2
```

### 2. Environment
Create a `.env` in the repo root (or copy it to `server/.env`). The backend loads env vars via `dotenv` from the server working directory.

```bash
cp .env server/.env   # if your secrets live at the repo root
```

Suggested local port (matches frontend `apiConfig` in development):

```bash
echo 'PORT=3001' >> server/.env
```

### 3. Backend
```bash
cd server
npm install
node server.js
# or: npm run dev  (nodemon)
```

Server default: `http://localhost:3001` (if `PORT=3001`)

### 4. Frontend
```bash
cd client
npm install
npm run dev
```

App: `http://localhost:5173` (Vite default)

### Quick health check
```bash
curl http://localhost:3001/health
```

---

## Environment Variables

| Variable | Required for | Description |
|----------|--------------|-------------|
| `MONGODB_URL` | Core | MongoDB connection string |
| `JWT_SECRET` | Auth | JWT signing secret |
| `PORT` | Core | Backend port (use `3001` for local client defaults) |
| `CALORIE_NINJA_API_KEY` | Search fallback | CalorieNinjas API |
| `OPENAI_API_KEY` | Image recognition | OpenAI Vision |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth | Google login |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | OAuth | GitHub login |
| `CLIENT_URL` | Optional | Frontend origin (CORS / reference) |
| `UPLOAD_DIR` | Optional | Upload directory name |
| `VITE_API_URL` | Frontend (optional) | Override API base (defaults to localhost / Render) |

> Never commit real `.env` files. Keep secrets out of git.

---

## Accuracy Notes

| Capability | Trust level | Notes |
|------------|-------------|--------|
| IFCT / INDB text search | High (reference data) | Official tables; values typically per 100g / listed serving |
| Northeast regional estimates | Directional | Explicitly labelled; home recipes may differ |
| Barcode / Open Food Facts | Medium | Depends on product listing completeness |
| Image → food name | Medium | Vision model ID; wrong name → wrong nutrition |
| Health score / GI | Directional | Heuristic formulas, not clinical lab measures |
| CalorieNinjas fallback | Medium | Useful when Indian DBs miss; may be Western-biased |
| BMR / TDEE / recipe estimates | Estimate | Standard equations / ingredient matching |
| First search after idle | Timing | Free Render may cold-start ~20–30s; warm-up + Pacman loader help UX |

Use FoodAnalyser as an **Indian nutrition intelligence assistant**, not medical advice.

---

## Research & Publication

This system has been extended into academic research and accepted at:

**IEEE CCPIS 2025**  
*"Intelligent Indian Food Nutrition Analysis Using AI & Official Nutrition Databases"*

---

## Roadmap

- Portion size estimation from images
- Stronger personalized AI diet planning
- Multilingual Indian food recognition
- Mobile app (React Native)
- Dietician & hospital dashboards
- Stronger confidence reporting for image analysis
- Measured GI datasets where available
- Optional paid / always-on hosting to remove cold starts entirely

---

## Project Structure

```
foodAnalyser-v2/
├── client/                      # React + Vite frontend
│   ├── src/
│   │   ├── pages/               # Home, cuisine, category, compare, plan,
│   │   │                        # tracker, profile, recipe, scan, image,
│   │   │                        # calculator, auth, about, reviews
│   │   ├── components/          # Feature components + ui/ (shadcn-style)
│   │   │   └── ui/
│   │   │       ├── loadingCard.jsx      # Pacman cold-start loader
│   │   │       └── page-not-found.tsx   # Immersive 404
│   │   ├── utils/               # Auth, theme, sync, fetch, API config
│   │   ├── data/                # Discovery / regional variant content
│   │   └── App.jsx              # Routes + backend warm-up ping
│   ├── public/                  # Static food / image assets
│   └── vercel.json              # SPA rewrites for client routes
├── server/                      # Express API
│   ├── routes/                  # auth, food, scan, image, reviews,
│   │                            # calories, sync
│   ├── models/                  # Mongoose schemas
│   ├── middleware/              # JWT auth, rate limits
│   └── data/                    # IFCT, INDB, Assam JSON datasets
├── screenshots/                 # Product screenshots for this README
└── README.md                    # You are here
```

---

## Author

**Suvam Neog**  
B.Tech CSE · Full-Stack & AI Systems Developer  
Research contributor (IEEE CCPIS 2025)

© 2026 Suvam Neog. All rights reserved.  
Shared for educational and portfolio purposes.
