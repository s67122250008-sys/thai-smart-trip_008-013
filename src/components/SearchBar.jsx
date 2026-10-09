import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Search, X } from 'lucide-react';

export default function SearchBar({ initialValue = '', onSearch, className = '' }) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/discover${query ? `?q=${encodeURIComponent(query)}` : ''}`);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      id="search-bar-form"
      className={`relative flex items-center w-full max-w-2xl bg-white rounded-full shadow-lg border border-slate-200/90 p-1.5 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all ${className}`}
    >
      <div className="pl-4 pr-2 text-slate-400">
        <Search className="w-5 h-5 text-emerald-600" />
      </div>

      <input
        type="text"
        id="search-bar-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={t('hero.searchPlaceholder')}
        className="w-full bg-transparent py-2.5 text-sm md:text-base text-slate-800 placeholder-slate-400 focus:outline-hidden font-normal"
      />

      {searchTerm && (
        <button
          type="button"
          id="search-clear-btn"
          onClick={handleClear}
          className="p-1.5 mr-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <button
        type="submit"
        id="search-submit-btn"
        className="px-5 md:px-7 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs transition-all duration-150 cursor-pointer whitespace-nowrap"
      >
        {t('hero.searchButton')}
      </button>
    </form>
  );
}
