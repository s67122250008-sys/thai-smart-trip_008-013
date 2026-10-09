import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Compass, MapPin, Sparkles } from 'lucide-react';

export default function Footer() {
  const { t, getRegionName } = useLanguage();

  const regions = ['north', 'central', 'northeast', 'south'];

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                Thai Smart Trip
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="pt-2 text-xs text-emerald-400 font-medium">
              Frontend-First • Firebase Cloud DB • Cloudflare Ready
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {t('nav.discover')}
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/discover" className="hover:text-emerald-400 transition-colors">
                  {t('nav.discover')}
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-emerald-400 transition-colors">
                  {t('nav.favorites')}
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-emerald-400 transition-colors">
                  {t('nav.profile')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Regions Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {t('sections.exploreByRegion')}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
              {regions.map((reg) => (
                <Link
                  key={reg}
                  to={`/discover?region=${reg}`}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {getRegionName(reg)}
                </Link>
              ))}
            </div>
          </div>

          {/* Tourism Inspiration & Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Amazing Thailand
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore 77 provinces with authentic cultural heritage, serene beaches, mountain peaks, and street food wonders.
            </p>
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/50 text-xs text-slate-300">
              <span className="font-semibold text-emerald-400">Smart Map Links:</span> All destinations feature direct Google Maps links.
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Thai Smart Trip. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <span className="text-emerald-400">React + Vite + Firebase</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
