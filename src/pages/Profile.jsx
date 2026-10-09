import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchAllReviews, fetchDestinations } from '../services/firebase.js';
import DestinationCard from '../components/DestinationCard.jsx';
import {
  User,
  Heart,
  MessageSquare,
  Shield,
  LogOut,
  Mail,
  Calendar,
  LogIn,
  Star,
} from 'lucide-react';

export default function Profile() {
  const { t, getLocalized } = useLanguage();
  const { user, isAdmin, favorites, logout, login } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('favorites'); // 'favorites' | 'reviews'
  const [userReviews, setUserReviews] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      if (!user) return;
      setLoading(true);
      try {
        const [allReviews, allDestinations] = await Promise.all([
          fetchAllReviews(),
          fetchDestinations(),
        ]);
        setUserReviews(allReviews.filter((r) => r.userId === user.uid));
        setDestinations(allDestinations);
      } catch (err) {
        console.error('Error loading user profile data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">
            Sign in to view your profile
          </h2>
          <p className="text-sm text-slate-500">
            Access your saved favorite destinations and traveler reviews across devices.
          </p>
        </div>
        <button
          onClick={login}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>{t('nav.login')}</span>
        </button>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const favoriteDestinations = destinations.filter((d) => favorites.includes(d.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-0 opacity-60" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          {/* User Info */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left">
            <img
              src={
                user.photoURL ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
              }
              alt={user.displayName}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-full object-cover ring-4 ring-emerald-50 shadow-md"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl font-bold text-slate-900">
                  {user.displayName}
                </h1>
                <span
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                    isAdmin
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {isAdmin ? t('profile.roleAdmin') : t('profile.roleUser')}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 flex items-center justify-center md:justify-start gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.email}</span>
              </p>

              <p className="text-xs text-slate-400">
                Authenticated via Google Sign-In
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                id="profile-admin-cta"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>{t('profile.adminButton')}</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              id="profile-logout-btn"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('profile.logoutButton')}</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100 max-w-md">
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 block">
                {favorites.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {t('profile.statsFavorites')}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 block">
                {userReviews.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {t('profile.statsReviews')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'favorites'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>{t('profile.myFavorites')} ({favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t('profile.myReviews')} ({userReviews.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'favorites' && (
          <div>
            {favoriteDestinations.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                {t('favorites.emptyTitle')}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteDestinations.map((dest) => (
                  <DestinationCard key={dest.id} destination={dest} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {userReviews.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No reviews posted yet.
              </div>
            ) : (
              userReviews.map((rev) => {
                const targetDest = destinations.find((d) => d.id === rev.destinationId);
                const destTitle = targetDest ? getLocalized(targetDest.name) : rev.destinationId;

                return (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/destination/${rev.destinationId}`}
                        className="text-sm font-bold text-emerald-700 hover:underline"
                      >
                        {destTitle}
                      </Link>
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= Number(rev.rating || 5)
                                ? 'fill-current text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 block">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
