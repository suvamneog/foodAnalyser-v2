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

FoodAnalyser is a full-stack nutrition intelligence platform built specifically for Indian dietary patterns, combining official Indian nutrition datasets (IFCT 2017 & INDB) with AI-based food recognition, barcode analysis, and personalized health scoring.

Unlike generic calorie apps that rely on Western datasets, FoodAnalyser delivers authentic, verified Indian nutrition analysis with real-world usability.

**Designed for:** Indian consumers, fitness enthusiasts, dieticians, health-tech startups, and nutrition research.

---

## Why FoodAnalyser Is Different

1. Built on IFCT 2017 (ICMR–NIN) — India's official food composition table
2. Uses INDB (Indian Nutrient Databank) for cooked & traditional recipes
3. AI-powered food image recognition
4. Barcode scanning with Indian food mapping
5. Nutrition-aware health scoring engine
6. Secure meal logging & analytics
7. Deployed, scalable & research-ready

This is not a CRUD project — it is a nutrition intelligence system.

---

## Data Sources (Core Strength)

### 🇮🇳 IFCT 2017 (ICMR–NIN)
- 528+ Indian food items
- Macro & micro nutrients
- Vitamins, minerals, amino acids
- Standardized per 100g values
- Government-verified dataset

### 🇮🇳 INDB (Indian Nutrient Databank)
- Cooked foods & traditional Indian recipes
- Serving-based nutrition
- Beverage & regional food coverage

### 🌍 External (Fallback Only)
- OpenFoodFacts (packaged foods)
- CalorieNinjas (only when Indian data unavailable)

---

## Core Features

### 🔍 Indian-Optimized Food Search
- Search powered by IFCT & INDB
- Intelligent grouping (raw, cooked, fried, curry, beverage)
- Avoids duplicate Western entries
- Logs searches for analytics

### 📷 AI Food Image Recognition
- Upload food image
- AI identifies food item
- Nutrition matched against IFCT / INDB
- Glycemic impact estimation
- Health score + healthier Indian alternatives

### 📦 Barcode Scanning (Packaged Foods)
- Barcode decoding using ZXing + Sharp
- Product fetch via OpenFoodFacts
- Nutrition normalization
- Indian food equivalent mapping
- Health score computation

### 🧮 Health & Diet Calculator
- BMR (Mifflin-St Jeor Equation)
- TDEE calculation
- Activity-based calorie goals
- Protein intake estimation

### 🧾 Meal Logging & Nutrition Tracking
- Secure JWT-based logging
- Per-meal macro aggregation
- Daily nutrition totals
- History filtering (date, calories, meal type)

### 👤 Authentication & Security
- Email/password login
- JWT authentication middleware
- Google & GitHub OAuth support
- Secure API access control

### ⭐ Review & Feedback System
- Guest & authenticated reviews
- Rating distribution analytics
- Real-time updates (Socket.io)
- Pagination & stats API

---

## 📸 Screenshots

### 🏠 Home & Food Search
![Home](./screenshots/Homepage.png)

### 🔍 Indian Food Nutrition Search
![Food Search](./screenshots/Foodsearch.png)

### 📷 AI Food Image Recognition
![Image Recognition](./screenshots/Imagerecognition.png)

### 📦 Barcode Scanning & Product Analysis
![Barcode Scanner](./screenshots/BarcodeScan.png)

### 🧮 Health & Diet Calculator
![Calculator](./screenshots/CaloriesCal.png)

### 🧾 Meal Logging & Nutrition History
![Meal Logging](./screenshots/Logmeal.png)

### ⭐ Reviews & Feedback
![Reviews](./screenshots/Reviews.png)

---

## 🏗️ System Architecture

```
Frontend (React + Tailwind)
│
├── Auth Context (JWT / OAuth)
├── Food Search UI
├── Image Recognition UI
├── Barcode Scanner
├── Meal Logging & History
│
└── Backend (Node.js + Express)
    │
    ├── IFCT 2017 Nutrition Engine
    ├── INDB Recipe Engine
    ├── Food Search & Ranking Logic
    ├── OpenAI Vision (Image Analysis)
    ├── Health Scoring Engine
    ├── MongoDB Persistence
    └── Real-time Reviews (Socket.io)
```

---

## 🛠️ Tech Stack

### Frontend
- React (JSX)
- Context API
- Tailwind CSS
- Axios

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Passport (Google, GitHub OAuth)
- OpenAI Vision API
- Sharp (image processing)
- ZXing (barcode decoding)
- Socket.io (real-time reviews)

---

## 🌐 Deployment

- **Frontend:** Vercel
- **Backend:** Render

**Frontend:** https://foodanalyserr.vercel.app
**Backend:** https://foodanalyser.onrender.com

Environment switching handled automatically.

---

## ⚙️ Local Setup

### Backend
```bash
git clone https://github.com/suvamneog/foodAnalyser-v2.git
cd server
npm install
node server.js
```

### Frontend
```bash
git clone https://github.com/suvamneog/foodAnalyser-v2.git
cd client
npm install
npm run dev
```

---

## 📄 Research & Publication

This system has been extended into academic research and accepted at:

**IEEE CCPIS 2025**
*"Intelligent Indian Food Nutrition Analysis Using AI & Official Nutrition Databases"*

---

## 🔮 Future Roadmap
- Portion size estimation from images
- Personalized AI diet planning
- Multilingual Indian food recognition
- Mobile app (React Native)
- Dietician & hospital dashboards

---

## 👨‍💻 Author

**Suvam Neog**
B.Tech CSE
Full-Stack & AI Systems Developer
Research contributor (IEEE CCPIS 2025)

© 2026 Suvam Neog. All rights reserved.
This project is shared for educational and portfolio purposes.
