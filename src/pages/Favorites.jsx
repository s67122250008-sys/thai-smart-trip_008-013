import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchDestinations } from '../services/firebase.js';
import DestinationCard from '../components/DestinationCard.jsx';
import { Heart, LogIn, Compass, ArrowRight } from 'lucide-react';

export default function Favorites() {
  const { t } = useLanguage();
  const { user, favorites, login, loading: authLoading } = useAuth();

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const all = await fetchDestinations();
        setDestinations(all);
      } catch (err) {
        console.error('Error fetching destinations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-400">
        {t('common.loading')}
      </div>
    );
  }

  // If user is guest, show friendly login prompt
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-xs">
          <Heart className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">
            {t('favorites.loginRequiredTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {t('favorites.loginRequiredSubtitle')}
          </p>
        </div>
        <button
          id="favorites-login-btn"
          onClick={login}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md transition-all cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>{t('nav.login')}</span>
        </button>
      </div>
    );
  }

  // Filter destinations that match user's favorites
  const favoriteDestinations = destinations.filter((d) => favorites.includes(d.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Heart className="w-7 h-7 text-rose-500 fill-current" />
            <span>{t('favorites.title')}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t('favorites.subtitle')}
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 self-start sm:self-auto">
          {favoriteDestinations.length} Saved Places
        </span>
      </div>

      {/* Favorites Content */}
      {favoriteDestinations.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white rounded-2xl border border-dashed border-slate-300 space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">
              {t('favorites.emptyTitle')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('favorites.emptySubtitle')}
            </p>
          </div>
          <Link
            to="/discover"
            id="empty-favorites-discover-link"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>{t('favorites.exploreButton')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {favoriteDestinations.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>
      )}
    </div>
  );
}
