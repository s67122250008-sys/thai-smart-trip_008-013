import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import {
  Compass,
  Heart,
  Search,
  User,
  Shield,
  LogOut,
  LogIn,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const { t } = useLanguage();
  const { user, isAdmin, favorites, login, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <Link
            to="/"
            id="nav-brand-link"
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight block leading-tight">
                Thai Smart Trip
              </span>
              <span className="text-[11px] text-emerald-700 font-medium block uppercase tracking-widest leading-none">
                Thailand Tourism
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <Link
              to="/"
              id="nav-link-home"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isActive('/') && location.pathname === '/'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-100'
              }`}
            >
              {t('nav.home')}
            </Link>

            <Link
              to="/discover"
              id="nav-link-discover"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                isActive('/discover')
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>{t('nav.discover')}</span>
            </Link>

            <Link
              to="/favorites"
              id="nav-link-favorites"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer relative ${
                isActive('/favorites')
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-100'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>{t('nav.favorites')}</span>
              {favorites.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full leading-none">
                  {favorites.length}
                </span>
              )}
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                id="nav-link-admin"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isActive('/admin')
                    ? 'bg-amber-50 text-amber-800 font-semibold'
                    : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/50'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span>{t('nav.admin')}</span>
              </Link>
            )}
          </nav>

          {/* Right Action Area (Language & Auth) */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />

            {user ? (
              <div className="relative">
                <button
                  id="user-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-slate-200 hover:border-emerald-300 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <img
                    src={
                      user.photoURL ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
                    }
                    alt={user.displayName}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-500/20"
                  />
                  <div className="text-left leading-tight hidden lg:block">
                    <span className="text-xs font-semibold text-slate-900 block truncate max-w-[110px]">
                      {user.displayName}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {isAdmin ? 'Admin' : 'Traveler'}
                    </span>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user.displayName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      id="dropdown-profile-link"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>{t('nav.profile')}</span>
                    </Link>

                    <Link
                      to="/favorites"
                      id="dropdown-favorites-link"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>{t('nav.favorites')} ({favorites.length})</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        id="dropdown-admin-link"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-900 hover:bg-amber-50 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-amber-600" />
                        <span>{t('nav.admin')}</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      id="dropdown-logout-btn"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="login-btn"
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition-all duration-150 hover:shadow-md cursor-pointer whitespace-nowrap"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('nav.login')}</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher compact={true} />
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            id="mobile-link-home"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-base font-medium ${
              isActive('/') && location.pathname === '/'
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'text-slate-700'
            }`}
          >
            {t('nav.home')}
          </Link>

          <Link
            to="/discover"
            id="mobile-link-discover"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium ${
              isActive('/discover')
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'text-slate-700'
            }`}
          >
            <Search className="w-5 h-5 text-emerald-600" />
            <span>{t('nav.discover')}</span>
          </Link>

          <Link
            to="/favorites"
            id="mobile-link-favorites"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-base font-medium ${
              isActive('/favorites')
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              <span>{t('nav.favorites')}</span>
            </div>
            {favorites.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full">
                {favorites.length}
              </span>
            )}
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              id="mobile-link-admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium ${
                isActive('/admin')
                  ? 'bg-amber-50 text-amber-800 font-semibold'
                  : 'text-slate-700'
              }`}
            >
              <Shield className="w-5 h-5 text-amber-600" />
              <span>{t('nav.admin')}</span>
            </Link>
          )}

          <div className="border-t border-slate-200 pt-3">
            {user ? (
              <div className="space-y-2">
                <Link
                  to="/profile"
                  id="mobile-link-profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-800 hover:bg-slate-50"
                >
                  <img
                    src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user.displayName}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </Link>

                <button
                  id="mobile-logout-btn"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 font-medium rounded-lg hover:bg-red-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            ) : (
              <button
                id="mobile-login-btn"
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium shadow-sm hover:bg-emerald-700 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('nav.login')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
