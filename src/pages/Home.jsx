import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchDestinations } from '../services/firebase.js';
import SearchBar from '../components/SearchBar.jsx';
import DestinationCard from '../components/DestinationCard.jsx';
import {
  Compass,
  Sparkles,
  ArrowRight,
  MapPin,
  Palmtree,
  Mountain,
  Landmark,
  Waves,
  ShoppingBag,
  Trees,
  Star,
  Flame,
} from 'lucide-react';

const categoryIcons = {
  temple: Landmark,
  beach: Palmtree,
  mountain: Mountain,
  waterfall: Waves,
  nature: Trees,
  market: ShoppingBag,
  museum: Landmark,
};

const regionBanners = [
  {
    id: 'north',
    image: "image/region/north.jpg",
    accent: 'from-emerald-900/80 to-teal-950/90',
  },
  {
    id: 'central',
    image: "image/region/central.jpg",
    accent: 'from-amber-950/80 to-stone-900/90',
  },
  {
    id: 'northeast',
    image: "image/region/northeast.jpg",
    accent: 'from-stone-900/80 to-emerald-950/90',
  },
  {
    id: 'south',
    image: "image/region/south.jpg",
    accent: 'from-cyan-950/80 to-blue-950/90',
  },
];

export default function Home() {
  const { t, getCategoryName, getRegionName, categoriesData } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchDestinations();
        setDestinations(data);
      } catch (err) {
        console.error('Error fetching destinations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const featured = destinations.filter((d) => Number(d.rating) >= 4.8).slice(0, 3);
  const recommended = destinations.slice(0, 6);

  const handleLoginPrompt = async () => {
    try {
      await login();
    } catch (e) {
      console.warn('Login prompted:', e);
    }
  };

  return (
    <div className="space-y-16 md:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative min-h-[540px] md:min-h-[620px] flex items-center justify-center overflow-hidden rounded-b-3xl bg-slate-900 shadow-lg">
        {/* Hero Background Image with Subtle Parallax feel */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=1920&q=85"
            alt="Thailand Travel Landscape"
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-black/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 md:space-y-8 pt-10 pb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-300 text-xs font-semibold tracking-wide shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Amazing Thailand Tourism Guide</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight md:leading-tight">
            {t('hero.title')}
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-200/90 max-w-2xl mx-auto font-normal leading-relaxed">
            {t('hero.subtitle')}
          </p>

          {/* Centered Search Bar */}
          <div className="pt-2 flex justify-center">
            <SearchBar />
          </div>

          {/* Quick Popular Keywords */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-300">
            <span className="text-slate-400 font-medium">{t('hero.popularTags')}</span>
            {['Chiang Mai', 'Phuket', 'Bangkok', 'Ayutthaya', 'Krabi'].map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/discover?q=${encodeURIComponent(tag)}`)}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xs text-slate-200 transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t('sections.categories')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t('sections.categoriesSubtitle')}
            </p>
          </div>
          <Link
            to="/discover"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <span>{t('sections.viewAll')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {categoriesData.map((cat) => {
            const Icon = categoryIcons[cat.id] || Landmark;
            return (
              <Link
                key={cat.id}
                id={`cat-card-${cat.id}`}
                to={`/discover?category=${cat.id}`}
                className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 text-center hover:-translate-y-0.5"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors mb-3">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">
                  {getCategoryName(cat.id)}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4" />
              <span>{t('sections.featuredBadge')}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t('sections.featured')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t('sections.featuredSubtitle')}
            </p>
          </div>
          <Link
            to="/discover"
            className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <span>{t('sections.viewAll')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">{t('common.loading')}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {featured.map((dest) => (
              <DestinationCard
                key={dest.id}
                destination={dest}
                onLoginPrompt={handleLoginPrompt}
              />
            ))}
          </div>
        )}
      </section>

      {/* Explore By Region */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('sections.exploreByRegion')}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {t('sections.exploreByRegionSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {regionBanners.map((reg) => (
            <Link
              key={reg.id}
              to={`/discover?region=${reg.id}`}
              className="group relative h-48 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex items-end p-4 text-white hover:scale-[1.02]"
            >
              <img
                src={reg.image}
                alt={getRegionName(reg.id)}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${reg.accent}`} />
              <div className="relative z-10">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 block">
                  Region
                </span>
                <h3 className="text-sm md:text-base font-bold text-white group-hover:text-emerald-200 transition-colors">
                  {getRegionName(reg.id)}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recommended Destinations Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t('sections.recommended')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t('sections.recommendedSubtitle')}
            </p>
          </div>
          <Link
            to="/discover"
            className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <span>{t('sections.viewAll')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">{t('common.loading')}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {recommended.map((dest) => (
              <DestinationCard
                key={dest.id}
                destination={dest}
                onLoginPrompt={handleLoginPrompt}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
