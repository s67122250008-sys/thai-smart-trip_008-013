import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchDestinationById,
  fetchDestinations,
} from '../services/firebase.js';
import DestinationCard from '../components/DestinationCard.jsx';
import ReviewSection from '../components/ReviewSection.jsx';
import { getDestinationFallbackImage } from '../utils/imageFallback.js';
import {
  ArrowLeft,
  Star,
  MapPin,
  Heart,
  ExternalLink,
  Layers,
  Compass,
  Sparkles,
} from 'lucide-react';

export default function DestinationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, getLocalized, getProvinceName, getCategoryName, getRegionName } = useLanguage();
  const { user, isFavorite, toggleFavorite, login } = useAuth();

  const [destination, setDestination] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const dest = await fetchDestinationById(id);
        setDestination(dest);

        if (dest) {
          const all = await fetchDestinations();
          const filtered = all
            .filter((d) => d.id !== dest.id && (d.region === dest.region || d.category === dest.category))
            .slice(0, 3);
          setRelated(filtered);
        }
      } catch (err) {
        console.error('Failed to load destination detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-400">
        {t('common.loading')}
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Destination Not Found</h2>
        <p className="text-sm text-slate-500">
          The destination you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/discover"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('discover.title')}</span>
        </Link>
      </div>
    );
  }

  const title = getLocalized(destination.name);
  const description = getLocalized(destination.description);
  const province = getProvinceName(destination.province);
  const category = getCategoryName(destination.category);
  const region = getRegionName(destination.region);
  const isFav = isFavorite(destination.id);

  const handleFavoriteClick = async () => {
    if (!user) {
      await login();
      return;
    }
    await toggleFavorite(destination.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-10">
      {/* Breadcrumb / Back Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          id="detail-back-btn"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors p-2 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('detail.back')}</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-slate-600">
            {t('nav.home')}
          </Link>
          <span>/</span>
          <Link to={`/discover?region=${destination.region}`} className="hover:text-slate-600">
            {region}
          </Link>
          <span>/</span>
          <span className="text-slate-700 font-medium truncate max-w-[160px]">{title}</span>
        </div>
      </div>

      {/* Main Destination Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl bg-slate-900 border border-slate-200">
        <div className="relative aspect-21/9 min-h-[360px] md:min-h-[440px] w-full">
          <img
            src={destination.image || getDestinationFallbackImage(destination)}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const fb = getDestinationFallbackImage(destination);
              if (e.target.src !== fb) {
                e.target.src = fb;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Top Actions on Banner */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              id="detail-favorite-toggle-btn"
              onClick={handleFavoriteClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md text-xs font-semibold shadow-md transition-all cursor-pointer ${
                isFav
                  ? 'bg-rose-500 text-white hover:bg-rose-600'
                  : 'bg-black/50 hover:bg-black/70 text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
              <span>{isFav ? t('detail.favoriteRemove') : t('detail.favoriteAdd')}</span>
            </button>
          </div>

          {/* Bottom Info on Hero */}
          <div className="absolute bottom-6 left-6 right-6 space-y-3 text-white">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-600 text-white shadow-xs">
                {category}
              </span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/20 backdrop-blur-md text-white">
                {province} • {region}
              </span>
              <div className="flex items-center gap-1 bg-amber-500 px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs">
                <Star className="w-3.5 h-3.5 fill-current text-white" />
                <span>{Number(destination.rating || 4.5).toFixed(1)}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              {title}
            </h1>

            {/* Multilingual names subtext */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300 font-light">
              {destination.name?.th && <span>🇹🇭 {destination.name.th}</span>}
              {destination.name?.en && <span>🇬🇧 {destination.name.en}</span>}
              {destination.name?.zh && <span>🇨🇳 {destination.name.zh}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Details Left, Meta/Action Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Description & Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600" />
              <span>{t('detail.about')}</span>
            </h2>
            <p className="text-slate-700 text-sm md:text-base leading-relaxed whitespace-pre-line">
              {description}
            </p>

            {/* If there are descriptions in other languages, display them nicely */}
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Multilingual Descriptions
              </h4>
              {destination.description?.th && (
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                  <span className="font-semibold text-emerald-700 mr-2">TH:</span>
                  {destination.description.th}
                </div>
              )}
              {destination.description?.en && (
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                  <span className="font-semibold text-emerald-700 mr-2">EN:</span>
                  {destination.description.en}
                </div>
              )}
              {destination.description?.zh && (
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                  <span className="font-semibold text-emerald-700 mr-2">ZH:</span>
                  {destination.description.zh}
                </div>
              )}
            </div>
          </div>

          {/* Reviews Component */}
          <ReviewSection
            destinationId={destination.id}
            destinationName={title}
            onLoginPrompt={login}
          />
        </div>

        {/* Right Col: Quick Location Details & Maps CTA */}
        <div className="space-y-6">
          {/* Location & Navigation Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{t('detail.locationInfo')}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{t('detail.province')}</span>
                <span className="font-semibold text-slate-900">{province}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{t('detail.region')}</span>
                <span className="font-semibold text-slate-900">{region}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{t('detail.category')}</span>
                <span className="font-semibold text-emerald-700">{category}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{t('detail.rating')}</span>
                <span className="font-bold text-amber-600">
                  ★ {Number(destination.rating || 4.5).toFixed(1)} / 5.0
                </span>
              </div>
            </div>

            {/* Google Maps Button */}
            {destination.mapsUrl ? (
              <a
                href={destination.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="detail-google-maps-btn"
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{t('detail.openGoogleMaps')}</span>
              </a>
            ) : (
              <div className="text-center text-xs text-slate-400">
                No Google Maps link available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Destinations */}
      {related.length > 0 && (
        <div className="pt-10 border-t border-slate-200 space-y-6">
          <h3 className="text-xl font-bold text-slate-900">
            {t('detail.relatedDestinations')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {related.map((d) => (
              <DestinationCard key={d.id} destination={d} onLoginPrompt={login} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
