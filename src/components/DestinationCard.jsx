import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Star, MapPin, Heart, ExternalLink } from 'lucide-react';
import { getDestinationFallbackImage } from '../utils/imageFallback.js';

export default function DestinationCard({ destination, onLoginPrompt }) {
  const { getLocalized, getProvinceName, getCategoryName } = useLanguage();
  const { isFavorite, toggleFavorite, user } = useAuth();

  if (!destination) return null;

  const title = getLocalized(destination.name);
  const description = getLocalized(destination.description);
  const province = getProvinceName(destination.province);
  const category = getCategoryName(destination.category);
  const isFav = isFavorite(destination.id);
  const fallbackImg = getDestinationFallbackImage(destination);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user && onLoginPrompt) {
      onLoginPrompt();
      return;
    }
    await toggleFavorite(destination.id);
  };

  const handleMapsClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      id={`destination-card-${destination.id}`}
      className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        <img
          src={destination.image || fallbackImg}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            if (e.target.src !== fallbackImg) {
              e.target.src = fallbackImg;
            }
          }}
        />

        {/* Gradient overlay on top & bottom of image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
          {/* Category Pill */}
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-950/70 backdrop-blur-md text-emerald-300 border border-emerald-500/20 shadow-xs">
            {category}
          </span>

          {/* Favorite Toggle Button */}
          <button
            id={`fav-btn-${destination.id}`}
            onClick={handleFavoriteClick}
            aria-label="Add to favorites"
            className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md ${
              isFav
                ? 'bg-rose-500 text-white hover:bg-rose-600 scale-105'
                : 'bg-black/40 text-white hover:bg-black/60 hover:text-rose-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Rating & Province Badges on Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 text-white text-xs font-medium bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-[140px]">{province}</span>
          </div>

          <div className="flex items-center gap-1 bg-amber-500/95 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
            <Star className="w-3.5 h-3.5 fill-current text-white" />
            <span>{Number(destination.rating || 4.5).toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <Link
            to={`/destination/${destination.id}`}
            className="group-hover:text-emerald-700 transition-colors focus:outline-hidden"
          >
            <h3 className="text-base font-bold text-slate-900 line-clamp-1 leading-snug">
              {title}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Footer Action Links */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Direct Google Maps Shortcut */}
          {destination.mapsUrl ? (
            <a
              href={destination.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleMapsClick}
              id={`card-maps-link-${destination.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-emerald-700 transition-colors py-1 px-2 rounded-md hover:bg-emerald-50"
              title="Open location in Google Maps"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              <span>Google Maps</span>
            </a>
          ) : (
            <span />
          )}

          {/* View Details Link */}
          <Link
            to={`/destination/${destination.id}`}
            id={`card-view-link-${destination.id}`}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline py-1"
          >
            Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
