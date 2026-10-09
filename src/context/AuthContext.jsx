import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginWithGoogle,
  logoutUser,
  subscribeToAuth,
  fetchUserFavorites,
  addFavorite,
  removeFavorite,
} from '../services/firebase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [authError, setAuthError] = useState(null);

  // Subscribe to auth changes
  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        loadFavorites(currentUser.uid);
      } else {
        setFavorites([]);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const loadFavorites = async (uid) => {
    try {
      const favDocs = await fetchUserFavorites(uid);
      setFavorites(favDocs.map((f) => f.destinationId));
    } catch (err) {
      console.warn('Failed to load favorites:', err);
    }
  };

  const login = async () => {
    setAuthError(null);
    try {
      const loggedUser = await loginWithGoogle();
      setUser(loggedUser);
      if (loggedUser) {
        await loadFavorites(loggedUser.uid);
      }
      return loggedUser;
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setFavorites([]);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const toggleFavorite = async (destinationId) => {
    if (!user) {
      return { success: false, requireLogin: true };
    }

    const isFav = favorites.includes(destinationId);
    if (isFav) {
      // Optimistic update
      setFavorites((prev) => prev.filter((id) => id !== destinationId));
      await removeFavorite(user.uid, destinationId);
    } else {
      setFavorites((prev) => [...prev, destinationId]);
      await addFavorite(user.uid, destinationId);
    }
    return { success: true, isFavorite: !isFav };
  };

  const isFavorite = (destinationId) => {
    return favorites.includes(destinationId);
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'guest',
        isAdmin,
        loading,
        authError,
        favorites,
        login,
        logout,
        toggleFavorite,
        isFavorite,
        refreshFavorites: () => user && loadFavorites(user.uid),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
