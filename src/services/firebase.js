import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  get,
  set,
  push,
  remove,
  child,
  query,
  orderByChild,
  equalTo,
} from 'firebase/database';
import seedDestinations from '../data/destinations.json';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('YOUR_') &&
  !firebaseConfig.apiKey.includes('MY_')
);

// Initialize Firebase App
let app;
let auth = null;
let db = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getDatabase(app); // Realtime Database
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (err) {
    console.warn('Firebase initialization error, using local fallback:', err);
  }
}

// Local mock storage for offline/fallback
const LOCAL_STORAGE_KEYS = {
  DESTINATIONS: 'thai_trip_destinations_cache',
  FAVORITES: 'thai_trip_favorites_cache',
  REVIEWS: 'thai_trip_reviews_cache',
  USER_PROFILE: 'thai_trip_user_profile',
};

function getLocalDestinations() {
  const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.DESTINATIONS);
  if (cached) {
    try { return JSON.parse(cached); } catch {}
  }
  localStorage.setItem(LOCAL_STORAGE_KEYS.DESTINATIONS, JSON.stringify(seedDestinations));
  return seedDestinations;
}

function saveLocalDestinations(data) {
  localStorage.setItem(LOCAL_STORAGE_KEYS.DESTINATIONS, JSON.stringify(data));
}

function getLocalFavorites() {
  const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.FAVORITES);
  return cached ? JSON.parse(cached) : [];
}

function saveLocalFavorites(data) {
  localStorage.setItem(LOCAL_STORAGE_KEYS.FAVORITES, JSON.stringify(data));
}

function getLocalReviews() {
  const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.REVIEWS);
  return cached ? JSON.parse(cached) : [];
}

function saveLocalReviews(data) {
  localStorage.setItem(LOCAL_STORAGE_KEYS.REVIEWS, JSON.stringify(data));
}

// ----------------------------------------------------
// AUTHENTICATION SERVICES (Google Login ONLY)
// ----------------------------------------------------

export async function loginWithGoogle() {
  if (isFirebaseConfigured && auth && googleProvider) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      let role = 'user'; // ค่าเริ่มต้นสำหรับผู้ใช้ใหม่ทุกคน

      if (db) {
        const userRef = ref(db, `users/${user.uid}`);
        const snap = await get(userRef);

        if (!snap.exists()) {
          // ผู้ใช้ใหม่: สร้างโปรไฟล์ลง DB พร้อม role = 'user'
          await set(userRef, {
            uid: user.uid,
            displayName: user.displayName || 'Traveler',
            email: user.email || '',
            photoURL: user.photoURL || '',
            role: 'user',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          });
        } else {
          // ผู้ใช้เก่า: ดึงค่า role จาก Realtime Database เสมอ
          const userData = snap.val();
          if (userData && userData.role) {
            role = userData.role;
          }
          await set(ref(db, `users/${user.uid}/lastLogin`), new Date().toISOString());
        }
      }

      return {
        uid: user.uid,
        displayName: user.displayName || 'Traveler',
        email: user.email,
        photoURL: user.photoURL,
        role,
      };
    } catch (err) {
      console.error('Firebase Google sign-in failed:', err);
      throw err;
    }
  }

  const mockUser = {
    uid: 'google-user-' + Math.random().toString(36).substring(2, 9),
    displayName: 'Google Traveler',
    email: 'traveler@gmail.com',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'admin',
  };
  localStorage.setItem(LOCAL_STORAGE_KEYS.USER_PROFILE, JSON.stringify(mockUser));
  return mockUser;
}

export async function logoutUser() {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
  localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_PROFILE);
}

// ฟังก์ชันติดตามสถานะการ Login (ดึง role จาก Database 100%)
export function subscribeToAuth(callback) {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let role = 'user';
        if (db) {
          try {
            const snap = await get(ref(db, `users/${firebaseUser.uid}`));
            if (snap.exists() && snap.val().role) {
              role = snap.val().role;
            }
          } catch (e) {
            console.warn('Failed to fetch user role:', e);
          }
        }
        callback({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Traveler',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          role,
        });
      } else {
        callback(null);
      }
    });
  }

  const cachedUser = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_PROFILE);
  if (cachedUser) {
    try { callback(JSON.parse(cachedUser)); } catch { callback(null); }
  } else {
    callback(null);
  }
  return () => {};
}

// ----------------------------------------------------
// DESTINATIONS (Realtime Database)
// ----------------------------------------------------

export async function fetchDestinations() {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await get(ref(db, 'destinations'));
      if (snap.exists()) {
        const val = snap.val();
        return Object.keys(val).map((key) => ({ docId: key, ...val[key] }));
      }
      return seedDestinations;
    } catch (err) {
      console.warn('RTDB fetchDestinations error, using fallback:', err);
      return getLocalDestinations();
    }
  }
  return getLocalDestinations();
}

export async function fetchDestinationById(id) {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await get(ref(db, `destinations/${id}`));
      if (snap.exists()) {
        return { docId: id, ...snap.val() };
      }
    } catch (err) {
      console.warn('RTDB fetchDestinationById error, using fallback:', err);
    }
  }
  const localList = getLocalDestinations();
  return localList.find((d) => d.id === id) || null;
}

export async function createDestination(destinationData) {
  const cleanId = destinationData.id || `dest-${Date.now()}`;
  const payload = {
    ...destinationData,
    id: cleanId,
    rating: Number(destinationData.rating) || 4.5,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    await set(ref(db, `destinations/${cleanId}`), payload);
    return { docId: cleanId, ...payload };
  }

  const list = getLocalDestinations();
  list.unshift(payload);
  saveLocalDestinations(list);
  return payload;
}

export async function updateDestination(id, updatedData) {
  const payload = {
    ...updatedData,
    id,
    rating: Number(updatedData.rating) || 4.5,
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    await set(ref(db, `destinations/${id}`), payload);
    return payload;
  }

  const list = getLocalDestinations();
  const idx = list.findIndex((d) => d.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...payload };
    saveLocalDestinations(list);
  }
  return payload;
}

export async function deleteDestination(id) {
  if (isFirebaseConfigured && db) {
    await remove(ref(db, `destinations/${id}`));
  }
  const list = getLocalDestinations();
  saveLocalDestinations(list.filter((d) => d.id !== id));
  return true;
}

export async function seedInitialDestinationsToFirestore() {
  if (isFirebaseConfigured && db) {
    for (const item of seedDestinations) {
      await set(ref(db, `destinations/${item.id}`), item);
    }
    return true;
  }
  saveLocalDestinations(seedDestinations);
  return true;
}

// ----------------------------------------------------
// FAVORITES (Realtime Database)
// ----------------------------------------------------

export async function fetchUserFavorites(userId) {
  if (!userId) return [];
  if (isFirebaseConfigured && db) {
    try {
      const snap = await get(ref(db, `favorites/${userId}`));
      if (snap.exists()) {
        const val = snap.val();
        return Object.keys(val).map((k) => ({ id: k, ...val[k] }));
      }
      return [];
    } catch (err) {
      console.warn('RTDB fetchUserFavorites error, using fallback:', err);
    }
  }
  const allFavs = getLocalFavorites();
  return allFavs.filter((f) => f.userId === userId);
}

export async function addFavorite(userId, destinationId) {
  if (!userId || !destinationId) return false;
  const newFav = { userId, destinationId, createdAt: new Date().toISOString() };

  if (isFirebaseConfigured && db) {
    await set(ref(db, `favorites/${userId}/${destinationId}`), newFav);
    return true;
  }

  const favs = getLocalFavorites();
  if (!favs.some((f) => f.userId === userId && f.destinationId === destinationId)) {
    favs.push(newFav);
    saveLocalFavorites(favs);
  }
  return true;
}

export async function removeFavorite(userId, destinationId) {
  if (!userId || !destinationId) return false;
  if (isFirebaseConfigured && db) {
    await remove(ref(db, `favorites/${userId}/${destinationId}`));
    return true;
  }

  let favs = getLocalFavorites();
  saveLocalFavorites(favs.filter((f) => !(f.userId === userId && f.destinationId === destinationId)));
  return true;
}

// ----------------------------------------------------
// REVIEWS (Realtime Database)
// ----------------------------------------------------

export async function fetchDestinationReviews(destinationId) {
  if (!destinationId) return [];
  if (isFirebaseConfigured && db) {
    try {
      const snap = await get(ref(db, 'reviews'));
      if (snap.exists()) {
        const val = snap.val();
        return Object.keys(val)
          .map((k) => ({ id: k, ...val[k] }))
          .filter((r) => r.destinationId === destinationId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      return [];
    } catch (err) {
      console.warn('RTDB fetchDestinationReviews error:', err);
    }
  }
  const allReviews = getLocalReviews();
  return allReviews.filter((r) => r.destinationId === destinationId);
}

export async function fetchAllReviews() {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await get(ref(db, 'reviews'));
      if (snap.exists()) {
        const val = snap.val();
        return Object.keys(val).map((k) => ({ id: k, ...val[k] }));
      }
      return [];
    } catch (err) {
      console.warn('RTDB fetchAllReviews error:', err);
    }
  }
  return getLocalReviews();
}

export async function addReview({ userId, userDisplayName, userPhotoURL, destinationId, rating, comment }) {
  if (!userId || !destinationId || !comment) return null;

  const reviewPayload = {
    userId,
    userDisplayName: userDisplayName || 'Traveler',
    userPhotoURL: userPhotoURL || '',
    destinationId,
    rating: Number(rating) || 5,
    comment: comment.trim(),
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    const newRef = push(ref(db, 'reviews'));
    await set(newRef, reviewPayload);
    return { id: newRef.key, ...reviewPayload };
  }

  const newRev = { id: `rev-${Date.now()}`, ...reviewPayload };
  const reviews = getLocalReviews();
  reviews.unshift(newRev);
  saveLocalReviews(reviews);
  return newRev;
}

export async function deleteReview(reviewId) {
  if (!reviewId) return false;
  if (isFirebaseConfigured && db) {
    await remove(ref(db, `reviews/${reviewId}`));
    return true;
  }

  let reviews = getLocalReviews();
  saveLocalReviews(reviews.filter((r) => r.id !== reviewId));
  return true;
}

// ----------------------------------------------------
// STATS FOR ADMIN DASHBOARD
// ----------------------------------------------------

export async function fetchAdminStats() {
  const destinations = await fetchDestinations();
  const reviews = await fetchAllReviews();
  let userCount = 0;

  if (isFirebaseConfigured && db) {
    try {
      const snap = await get(ref(db, 'users'));
      if (snap.exists()) {
        userCount = Object.keys(snap.val()).length;
      }
    } catch {}
  }

  return {
    totalDestinations: destinations.length,
    totalReviews: reviews.length,
    totalUsers: userCount || 1,
  };
}

export { auth, db, googleProvider };