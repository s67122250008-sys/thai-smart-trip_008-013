# Thai Smart Trip 🇹🇭

A modern, lightweight Thai travel exploration web application built with **React**, **JavaScript**, **Vite**, and **Firebase**, optimized for deployment to **Cloudflare Pages**.

## ✨ Features
- 🏝️ **Iconic Destinations Guide:** Curated highlights across 77 Thai provinces in 4 regions (north, central, northeast, south).
- 🌐 **Trilingual Localization:** Instant language switching between Thai (`th`), English (`en`), and Chinese (`zh`).
- 🔍 **Smart Multi-Filtering:** Filter by Region, Province, Category, and Rating, with multilingual full-text search.
- 🗺️ **Direct Google Maps Navigation:** One-tap links (`https://www.google.com/maps/search/?api=1&query=...`) for every destination.
- 🔐 **Google Authentication:** Secure, passwordless sign-in with Firebase Auth.
- ❤️ **Personal Favorites:** Save and sync bookmarked destinations.
- ⭐ **Traveler Reviews:** Share ratings and reviews for destinations.
- 🛡️ **Admin Portal:** Manage destination records (CRUD) with client-side image compression, moderate user reviews, and seed initial data into Firebase Realtime Database.

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the project root (there is no `.env.example` in the repo) and fill in your Firebase configuration — 7 variables total:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=thai-smart-trip.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://thai-smart-trip-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=thai-smart-trip
VITE_FIREBASE_STORAGE_BUCKET=thai-smart-trip.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=862083110058
VITE_FIREBASE_APP_ID=1:862083110058:web:...
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Build for Production (Cloudflare Pages)
```bash
npm run build
```
The output directory will be `dist/`.

## 📚 Documentation
For complete architectural details, Realtime Database data nodes, security notes, and deployment instructions, refer to **`PROJECT.md`**.
