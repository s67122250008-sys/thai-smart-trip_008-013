# Thai Smart Trip — Project Documentation

Welcome to **Thai Smart Trip**, a modern, lightweight, frontend-first web application designed for exploring Thailand's premier travel destinations, authentic cultural highlights, regional landmarks, traveler reviews, and personal trip planning with multilingual support.

---

## 1. Project Overview
**Thai Smart Trip** is built from scratch as a clean single-page application (SPA) with React and Vite, backed by Firebase for authentication and the **Firebase Realtime Database** for cloud data operations. It eliminates backend servers, custom APIs, and runtime file writing, delivering an ultra-fast, beginner-friendly, and maintainable platform optimized for deployment on **Cloudflare Pages** or static hosting.

---

## 2. Project Goals
- **Radical Simplicity:** Eliminate redundant servers, custom REST endpoints, and complex state libraries.
- **Frontend-First Architecture:** Pure client-side React with direct Firebase SDK integrations.
- **Multilingual Accessibility:** Full native support for Thai (TH), English (EN), and Chinese (ZH).
- **Seamless Cloudflare Deployment:** Zero-runtime server dependencies; builds directly into static assets.
- **Authentic Tourism Experience:** Focus on high-quality destination photography, structured categorization, and direct Google Maps navigation links.

---

## 3. Technology Stack
The application strictly utilizes the following core technologies:

| Technology | Purpose | Notes |
| :--- | :--- | :--- |
| **React (v19)** | UI Component Library | Functional components, hooks, React Context |
| **JavaScript (ES Modules)** | Programming Language | Clean `.js` and `.jsx` (NO TypeScript runtime code) |
| **Vite (v6)** | Build Tool & Bundler | Ultra-fast local dev and optimized static production builds |
| **Tailwind CSS (v4)** | Styling Engine | Utility-first, responsive, lightweight design (`@import "tailwindcss"`) |
| **Firebase (v12)** | BaaS (Backend-as-a-Service) | Google Authentication & **Realtime Database** (client SDK) |
| **React Router (v7)** | Client-Side Routing | Clean SPA routing across Home, Discover, Detail, Favorites, Profile, Admin |
| **Lucide React** | Iconography | Modern, consistent vector icons |
| **Cloudflare Pages** | Hosting & CDN Target | Static hosting with edge distribution |

> **Note:** `tsconfig.json` and `vite.config.ts` exist only to configure the Vite bundler. All application source code in `src/` is plain JavaScript (`.js` / `.jsx` / `.json`).

---

## 4. Architecture

```text
                        ┌─────────────────────────────────────┐
                        │       React + Vite Application      │
                        │    (Hosted on Cloudflare Pages)     │
                        └──────────────────┬──────────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │                                             │
                    ▼                                             ▼
        ┌─────────────────────────┐                   ┌─────────────────────────┐
        │    Static Seed Data     │                   │   Firebase Services     │
        │       (src/data/)       │                   │      (Client SDK)       │
        ├─────────────────────────┤                   ├─────────────────────────┤
        │ • destinations.json     │                   │ • Firebase Auth (Google)│
        │ • provinces.json        │ ──[One-Time Seed]─┼─► • Realtime Database   │
        │ • categories.json       │                   │ • Offline localStorage  │
        └─────────────────────────┘                   └─────────────────────────┘
```

### Key Architectural Characteristics:
1. **No Node.js / Express Server:** The application has no custom backend server (`server.ts` or Express). HTTP scripts exist only as unused leftover dependencies in `package.json`.
2. **No Firebase Admin SDK:** All operations use the standard client Firebase Web SDK.
3. **No Dynamic File Writing:** JSON files are strictly read-only seed data and build-time assets.
4. **Direct Realtime Database Management:** After initial seeding, all admin CRUD actions and user reviews operate directly on Realtime Database nodes via the client SDK.
5. **Offline / Preview Fallback:** When live Firebase credentials are unavailable, data is served from a `localStorage` cache seeded from `src/data/destinations.json`.

---

## 5. Feature Scope

### 5.1 Guest Features (Public)
- **Home Landing:** Hero banner with quick search, featured highlights (top-rated destinations), category grids, region exploration, and recommended destinations.
- **Multilingual Switcher:** Instant switching between Thai (`th`), English (`en`), and Chinese (`zh`) across UI labels and destination contents.
- **Discover & Search:** Search by destination name, province, or category in any of the 3 languages.
- **Multi-Filter System:** Filter by Region, Province, Category, and Minimum Rating, with sorting by Rating or Name (A-Z).
- **Destination Detail View:** High-resolution local image, localized name/description, location badges, rating score, and direct Google Maps button (`https://www.google.com/maps/search/?api=1&query=...`).
- **Community Reviews Readout:** View traveler reviews and average scores for every destination.
- **Route Fallback:** Unknown URLs (`*`) render the Discover page.

### 5.2 Member Features (Authenticated via Google)
- **Google Sign-In:** One-click instant login via Google Popup (`signInWithPopup`, `prompt: 'select_account'`).
- **Favorite System:** Save and remove favorite destinations to a personal list in the Realtime Database (`favorites/{userId}/{destinationId}`).
- **Write Reviews:** Submit star ratings (1–5) and written feedback for visited destinations.
- **User Profile:** View personal profile image, name, email, favorite counts, review counts, and manage saved destinations.

### 5.3 Admin Features (Admin Role)
- **Admin Dashboard:** Access overview metrics (Total Destinations, Total Users, Total Reviews) via `fetchAdminStats()`.
- **Three Management Tabs:** Destinations, Reviews, and Seed.
- **Destination Management (CRUD):**
  - **Create:** Add new destination records with multilingual fields (TH, EN, ZH), province, region, category, rating, image, and Google Maps URL.
  - **Read:** Searchable table of all destinations (filter by id / name.th / name.en / province).
  - **Update:** Edit existing destination fields (id field locked while editing).
  - **Delete:** Remove destination records with confirmation dialog.
- **Destination Image Upload:** Local file picker with client-side validation and compression:
  - Accepts image files up to **15 MB** (`MAX_IMAGE_BYTES`), type-checked by `isImageFile()`.
  - `compressImage()` resizes to max dimension **1200 px** and encodes to **JPEG quality 0.8** as a base64 data URL stored inline in the record's `image` field.
  - **No Firebase Storage involved** — the image travels inside the record itself.
- **Review Moderation:** View all user-submitted reviews with quick deletion of inappropriate content.
- **Database Seeding Tool:** One-click utility (`seedInitialDestinationsToFirestore()` — legacy name, writes to the Realtime Database) to initialize data from `src/data/destinations.json`.

---

## 6. Authentication
- **Provider:** Firebase Authentication with **Google Sign-In ONLY** (`GoogleAuthProvider`).
- **No Passwords:** No email/password registrations, password resets, or custom JWT tokens.
- **Role Detection:**
  - New accounts are created at `users/{uid}` with `role: "user"`.
  - Designated administrator accounts (users with `role: "admin"` stored in `users/{uid}`) receive administrative privileges.
  - The client reads the role back from the Realtime Database on every auth state change (`AuthContext.jsx` exposes `role` and `isAdmin`).
- **Offline Preview Mode:** Without live Firebase credentials, a mock user with `role: "admin"` is used so the admin dashboard remains inspectable.

---

## 7. Firebase Services & Data Nodes

All cloud operations live in **`src/services/firebase.js`**, which imports from `firebase/auth` and `firebase/database` (**Realtime Database**, not Firestore).

### 7.1 Exported Service Functions

| Area | Functions |
| :--- | :--- |
| Setup | `isFirebaseConfigured`, re-exports `auth`, `db`, `googleProvider` |
| Auth | `loginWithGoogle()`, `logoutUser()`, `subscribeToAuth(callback)` |
| Destinations | `fetchDestinations()`, `fetchDestinationById(id)`, `createDestination(data)`, `updateDestination(id, data)`, `deleteDestination(id)`, `seedInitialDestinationsToFirestore()` |
| Favorites | `fetchUserFavorites(userId)`, `addFavorite(userId, destinationId)`, `removeFavorite(userId, destinationId)` |
| Reviews | `fetchDestinationReviews(destinationId)`, `fetchAllReviews()`, `addReview({...})`, `deleteReview(reviewId)` |
| Admin | `fetchAdminStats()` → `{ totalDestinations, totalReviews, totalUsers }` |

### 7.2 Realtime Database Nodes

#### 1. `users`
- **Path:** `users/{uid}`
- **Structure:**
  ```json
  {
    "displayName": "Somchai Traveler",
    "email": "traveler@gmail.com",
    "photoURL": "https://lh3.googleusercontent.com/...",
    "role": "user",
    "createdAt": "2026-08-23T06:50:00.000Z",
    "lastLogin": "2026-08-23T06:50:00.000Z"
  }
  ```

#### 2. `destinations`
- **Path:** `destinations/{destinationId}` (object map keyed by destination id)
- **Structure:** see Destination Schema in §8.1.

#### 3. `favorites`
- **Path:** `favorites/{userId}/{destinationId}` (nested per user, value stores destination reference data)
  ```text
  favorites/
    {userId}/
      {destinationId}: { ... }
  ```

#### 4. `reviews`
- **Path:** `reviews/{reviewId}` (push-generated id)
- **Structure:**
  ```json
  {
    "userId": "user_uid_123",
    "userDisplayName": "Somchai Traveler",
    "userPhotoURL": "https://lh3.googleusercontent.com/...",
    "destinationId": "doi-suthep",
    "rating": 5,
    "comment": "Beautiful sacred temple with panoramic view.",
    "createdAt": "2026-08-23T06:50:00.000Z"
  }
  ```

### 7.3 Offline localStorage Cache Keys
When Firebase is not configured, data is read/written to:
- `thai_trip_destinations_cache`
- `thai_trip_favorites_cache`
- `thai_trip_reviews_cache`
- `thai_trip_user_profile`
- `thai_trip_lang` (selected language)

---

## 8. JSON Data Structure & Schemas

### 8.1 Destination Schema (`src/data/destinations.json`) — 40 records
```json
{
  "id": "doi-suthep",
  "name": {
    "th": "วัดพระธาตุดอยสุเทพ",
    "en": "Wat Phra That Doi Suthep",
    "zh": "素贴寺"
  },
  "province": "chiang-mai",
  "region": "north",
  "category": "temple",
  "description": {
    "th": "วัดสำคัญคู่เมืองเชียงใหม่...",
    "en": "A famous temple in Chiang Mai...",
    "zh": "清迈著名寺庙..."
  },
  "image": "/image/destinations/doi-suthep.jpg",
  "rating": 4.8,
  "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Wat+Phra+That+Doi+Suthep+Chiang+Mai"
}
```
- **No `featured` field** — the Home page derives "featured" destinations as those with `rating >= 4.8` (top 3).
- All `image` values are local paths under `public/image/destinations/` (40 JPG files, one per record).
- All `mapsUrl` values are full Google Maps search URLs, not `maps.app.goo.gl` short links.

### 8.2 Province Schema (`src/data/provinces.json`) — 77 records
```json
{
  "id": "chiang-mai",
  "region": "north",
  "name": {
    "th": "เชียงใหม่",
    "en": "Chiang Mai",
    "zh": "清迈"
  }
}
```

### 8.3 Category Schema (`src/data/categories.json`) — 12 records
```json
{
  "id": "temple",
  "name": {
    "th": "วัดและศาสนสถาน",
    "en": "Temple & Cultural",
    "zh": "寺庙与文化"
  },
  "icon": "Church"
}
```
- `icon` is a **Lucide React icon name** used by the category grid (e.g. `Church`, `Trees`, `Palmtree`, `Compass`, `Landmark`, `MapPin`, `ShoppingBag`, `Home`, `Sparkles`, `Mountain`, `Waves`).
- Category ids: `temple`, `nature`, `beach`, `island`, `historical`, `landmark`, `market`, `town`, `shrine`, `mountain`, `waterfall`, `museum`.

### 8.4 Regions — strictly 4 values
`north`, `central`, `northeast`, `south` (used in `provinces.json`, destination records, the Admin form, and region images `public/image/region/*.jpg`).

---

## 9. Real Destination Data & Source of Truth

### 9.1 The Real Destination Dataset
The application uses the real destination dataset residing at `src/data/destinations.json` as its foundational source of truth.
- **Zero Mock / Fake Data:** All sample and hardcoded placeholder destinations have been strictly removed. Every destination in the application represents a real, verified Thailand travel destination with authentic multilingual metadata and genuine Google Maps navigation URLs.
- **Data Flow Architecture:**
  ```text
  src/data/destinations.json (Real Provided Dataset)
            ↓
  Initial Seed / localStorage Cache (offline fallback)
            ↓
  Realtime Database "destinations" node (Cloud Storage)
            ↓
  Application UI (Home, Discover, DestinationDetail, Favorites, Admin)
  ```
- **Preserved Multilingual Structure:**
  Each record strictly maintains localized nested attributes without truncation or replacement:
  - `name`: `{ "th": "...", "en": "...", "zh": "..." }`
  - `description`: `{ "th": "...", "en": "...", "zh": "..." }`
  - `province`: Normalized province ID matching `src/data/provinces.json`
  - `region`: Regional grouping strictly restricted to 4 regions (`north`, `central`, `northeast`, `south`)
  - `category`: Category ID matching `src/data/categories.json`
  - `image`: Local asset path under `public/` or an inline base64 data URL (admin uploads)
  - `rating`: Rating score (1.0–5.0)
  - `mapsUrl`: Genuine Google Maps link

### 9.2 Seeding & Local Offline Fallback
- **Admin Seeding Utility:** The Admin Dashboard (`/admin`) provides a one-click seed button (`seedInitialDestinationsToFirestore()`) that transfers the complete `src/data/destinations.json` dataset to the Realtime Database `destinations` node. (The function name still says "Firestore" for historical reasons — it writes to `firebase/database`.)
- **Local Fallback:** When running in preview or offline mode without live Firebase credentials (`isFirebaseConfigured` is false), the application seeds and reads from the `localStorage` cache, which is initialized from `src/data/destinations.json`, ensuring full operational fidelity with real Thailand data.

---

## 10. JSON Seed Data Flow
```text
destinations.json
        ↓
Initial seed data (One-time via Admin Seeder, or auto-seed into localStorage offline)
        ↓
Realtime Database destinations node
        ↓
Application Interface
```
- The JSON file serves purely as the initial baseline dataset.
- Once populated, administrators perform modifications directly against the Realtime Database.
- Database changes are **NOT** written back into the static `.json` files.

---

## 11. Multilingual System
The application provides a lightweight React Context (`src/context/LanguageContext.jsx`) managing 3 language dictionaries:
- `src/i18n/th.json` (Thai — default)
- `src/i18n/en.json` (English)
- `src/i18n/zh.json` (Chinese)

Each dictionary contains the same top-level keys: `admin`, `common`, `detail`, `discover`, `favorites`, `hero`, `nav`, `profile`, `regions`, `sections`.

Helper functions exposed by `useLanguage()`:
- `t(keyPath, params)` — dot-path lookup (`t('nav.discover')`) with English fallback and `{{param}}` interpolation.
- `getLocalized(obj)` — resolves localized entity fields (`getLocalized(item.name)`).
- `getProvinceName(id)`, `getCategoryName(id)`, `getRegionName(regionId)`.
- Selected language persists in `localStorage` (`thai_trip_lang`) and updates `document.documentElement.lang`.

---

## 12. Security Rules (`firestore.rules`)

> **Important — current reality:** The application data layer uses the **Realtime Database**, not Firestore. The `firestore.rules` file below is kept in the repository as a legacy/reference definition for the Firestore security model; **it is not consulted by the running application**, and no Realtime Database rules file exists in this repository yet. To enforce permissions in production, configure Realtime Database rules in the Firebase Console (e.g. require `request.auth != null` for writes and restrict admin paths to `users/{uid}.role == "admin"`).

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isAdmin() {
      return isAuthenticated() &&
        (
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
          request.auth.token.email in ['admin@thaismarttrip.com', 'systemconsultwork@gmail.com']
        );
    }

    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    match /destinations/{destinationId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    match /favorites/{favoriteId} {
      allow read: if isAuthenticated() && (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && (resource.data.userId == request.auth.uid || isAdmin());
    }

    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow delete: if (isAuthenticated() && resource.data.userId == request.auth.uid) || isAdmin();
    }
  }
}
```

---

## 13. Project Folder Structure
```text
thai-smart-trip/
│
├── public/
│   └── image/
│       ├── destinations/           # 40 local destination JPGs (one per record)
│       └── region/                 # north.jpg, central.jpg, northeast.jpg, south.jpg
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx              # Responsive header, auth menu & language switch
│   │   ├── Footer.jsx              # Tourism footer and regional links
│   │   ├── DestinationCard.jsx     # Photo card with favorite & maps buttons
│   │   ├── SearchBar.jsx           # Search bar with quick tags
│   │   ├── LanguageSwitcher.jsx    # TH/EN/ZH pill switcher
│   │   └── ReviewSection.jsx       # Star rating review list and input form
│   │
│   ├── pages/
│   │   ├── Home.jsx                # Hero, featured, categories, recommended
│   │   ├── Discover.jsx            # Multilingual search & multi-filtering
│   │   ├── DestinationDetail.jsx   # Detail view, maps link, reviews & related
│   │   ├── Favorites.jsx           # User's bookmarked destinations
│   │   ├── Profile.jsx             # Traveler profile & activity history
│   │   └── Admin.jsx               # Destination CRUD, image upload, review moderation, seeder
│   │
│   ├── data/
│   │   ├── destinations.json       # Seed destinations data (40 records)
│   │   ├── provinces.json          # Normalized Thai provinces (77 records)
│   │   └── categories.json         # Normalized travel categories (12 records, with icon)
│   │
│   ├── context/
│   │   ├── LanguageContext.jsx     # i18n localization context
│   │   └── AuthContext.jsx         # Firebase Google auth & favorites state
│   │
│   ├── services/
│   │   └── firebase.js             # Firebase Auth & Realtime Database client services
│   │
│   ├── utils/
│   │   ├── imageUpload.js          # Client-side image validation & JPEG compression (base64)
│   │   └── imageFallback.js        # Fallback image map for destinations & categories
│   │
│   ├── i18n/
│   │   ├── th.json                 # Thai translation dictionary
│   │   ├── en.json                 # English translation dictionary
│   │   └── zh.json                 # Chinese translation dictionary
│   │
│   ├── App.jsx                     # Main router layout
│   ├── main.jsx                    # App root mount
│   └── index.css                   # Tailwind CSS entry
│
├── firestore.rules                  # Legacy Firestore security definitions (see §12)
├── .env                             # Local Firebase credentials (7 VITE_FIREBASE_* vars, git-ignored)
├── .gitignore
├── package.json                     # Dependency declarations
├── index.html                       # HTML entry point with Google Fonts
├── vite.config.ts                   # Vite bundler configuration
├── tsconfig.json                    # Editor/bundler TS config (only vite.config.ts is TS)
├── metadata.json                    # AI Studio project metadata (not referenced by app code)
├── PROJECT.md                       # Master project documentation
└── README.md                        # Quick-start documentation
```

---

## 14. Required Packages Documentation

| Package Name | Why It Is Installed | Where It Is Used | Status |
| :--- | :--- | :--- | :--- |
| **`react`** | Core UI component foundation | Across all `.jsx` components | Required |
| **`react-dom`** | React DOM rendering integration | `src/main.jsx` | Required |
| **`react-router-dom`** | Client-side SPA routing | `src/App.jsx`, `Navbar.jsx`, Pages | Required |
| **`firebase`** | Google Auth & Realtime Database | `src/services/firebase.js` | Required |
| **`lucide-react`** | Consistent vector iconography | Across cards, navbars, buttons, categories | Required |
| **`@tailwindcss/vite`** | Modern zero-config Tailwind v4 plugin | `vite.config.ts` | Required |
| **`tailwindcss`** | CSS utility engine | `src/index.css` | Required |
| **`@vitejs/plugin-react`** | React fast-refresh Vite plugin | `vite.config.ts` | Required |

**Installed but currently unused in source code** (leftovers in `package.json`; safe to ignore or prune later): `express`, `dotenv`, `@google/genai`, `motion`, `typescript`, `tsx`, `esbuild`, `autoprefixer`, `@types/express`, `@types/node`, `@types/*`. No server entry point or GenAI code exists anywhere in `src/`.

---

## 15. Installation Commands

### Install Dependencies:
```bash
npm install
```

### Development Execution (port 3000, LAN-exposed):
```bash
npm run dev
```

### Production Build:
```bash
npm run build
```

### Preview Static Build:
```bash
npm run preview
```

---

## 16. Environment Variables
Create a `.env` file in the project root (there is **no** `.env.example` in the repository — create `.env` manually) with these **7** variables:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=thai-smart-trip.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://thai-smart-trip-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=thai-smart-trip
VITE_FIREBASE_STORAGE_BUCKET=thai-smart-trip.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=862083110058
VITE_FIREBASE_APP_ID=1:862083110058:web:...
```

> `VITE_FIREBASE_DATABASE_URL` is **required** by the Realtime Database client. `.env` is git-ignored (`.gitignore` contains `.env*`).

---

## 17. Firebase Setup Documentation
Follow these step-by-step instructions to configure Firebase:
1. **Create Firebase Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project named `thai-smart-trip`.
2. **Register Web App:** In Project Overview, click the Web icon (`</>`) to add a Web application.
3. **Enable Google Authentication:** Navigate to **Authentication** ➔ **Sign-in method** ➔ Click **Google** ➔ Enable and set project support email.
4. **Create Realtime Database:** Navigate to **Realtime Database** ➔ Click **Create database** ➔ Select a nearby cloud region and start in locked/production mode, then configure read/write rules for your needs.
5. **(Optional) Firestore Rules:** The repository's `firestore.rules` only applies if you also use Firestore; the app itself does not read or write Firestore.
6. **Populate `.env`:** Copy your Web App configuration keys plus the Realtime Database URL into `.env` using the `VITE_FIREBASE_*` naming format (see §16).
7. **Initialize Seed Data:** Run `npm run dev`, login as Admin, navigate to `/admin`, open the **Seed** tab, and click the seed button.

---

## 18. Google Login Documentation
- **Login Flow:** When a user clicks **Sign in with Google**, `signInWithPopup(auth, googleProvider)` is invoked with `prompt: 'select_account'`.
- **Profile Record:** Upon successful authentication, the user profile is created/updated at the `users/{uid}` node (with `role`, `createdAt`, and `lastLogin`).
- **Admin Assignment:** The user receives administrative rights when their `users/{uid}` record contains `role: "admin"`; the client exposes this as `isAdmin` in `AuthContext`.

---

## 19. Cloudflare Deployment Documentation
Deploying to **Cloudflare Pages** is turnkey:
1. **Connect GitHub:** Link your repository to Cloudflare Pages via the Cloudflare Dashboard.
2. **Build Settings:**
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Build Output Directory:** `dist`
3. **Environment Variables:** Add your `VITE_FIREBASE_*` credentials (including `VITE_FIREBASE_DATABASE_URL`) into Cloudflare Pages **Settings ➔ Environment Variables**.
4. **SPA Fallback Routing:** Cloudflare Pages automatically handles Single-Page Apps with `index.html` fallback.

---

## 20. Development Rules
- **Use JavaScript (.js, .jsx, .json) for application code; TypeScript exists only for Vite config.**
- **No custom Express or Node backend server.**
- **No Firebase Admin SDK on the client.**
- **Google Sign-In is the only authentication mechanism.**
- **JSON files are read-only initial seed data.**
- **All dynamic mutations occur in the Realtime Database (or localStorage cache when offline).**
- **Never hardcode API secrets in client source code** (use `.env` with `VITE_` prefixes).
- **Keep components modular, maintainable, and clean.**

---

## 21. What Is NOT Included
The following systems have been deliberately omitted to avoid over-engineering:
- ❌ No Express / Node.js backend server (`server.ts`).
- ❌ No Firebase Admin SDK or custom JWT server.
- ❌ No Email/password registration or password reset workflows.
- ❌ No runtime JSON file manipulation or file-system writing.
- ❌ No two-way continuous sync services between JSON and the database.
- ❌ No custom D3.js tile map rendering engines (standard Google Maps links are used).
- ❌ No heavy external state management libraries (e.g. Redux).
- ❌ No Firebase Storage — admin images are compressed client-side to base64 data URLs instead.

---

## 22. Future Expansion Ideas
- Advanced trip itinerary builder with daily schedules.
- Community question and answer board for travel tips.
- Real-time weather widgets for each Thai province.
- Move inline base64 images to Firebase Storage / CDN for large catalogs.
- Formalize Realtime Database rules file (`database.rules.json`) in the repository.
