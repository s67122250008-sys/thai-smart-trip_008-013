import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchDestinations } from '../services/firebase.js';
import DestinationCard from '../components/DestinationCard.jsx';
import {
  Search,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  MapPin,
  Star,
  Layers,
  ArrowUpDown,
} from 'lucide-react';

export default function Discover() {
  const { t, lang, getLocalized, getProvinceName, getCategoryName, getRegionName, provincesData, categoriesData } = useLanguage();
  const { login } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States initialized from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get('region') || 'all');
  const [selectedProvince, setSelectedProvince] = useState(searchParams.get('province') || 'all');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [minRating, setMinRating] = useState(searchParams.get('rating') || 'all');
  const [sortBy, setSortBy] = useState('rating'); // 'rating' | 'name'

  // Fetch Destinations
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchDestinations();
        setDestinations(data);
      } catch (err) {
        console.error('Failed to load destinations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Synchronize state when URL changes (e.g. user navigated with ?region=north)
  useEffect(() => {
    const q = searchParams.get('q');
    const region = searchParams.get('region');
    const province = searchParams.get('province');
    const category = searchParams.get('category');
    const rating = searchParams.get('rating');

    if (q !== null) setSearchTerm(q);
    if (region !== null) setSelectedRegion(region);
    if (province !== null) setSelectedProvince(province);
    if (category !== null) setSelectedCategory(category);
    if (rating !== null) setMinRating(rating);
  }, [searchParams]);

  // Update URL params when filters change
  const updateUrl = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val && val !== 'all') {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  const handleRegionChange = (reg) => {
    setSelectedRegion(reg);
    setSelectedProvince('all'); // reset province if region changes
    updateUrl({ region: reg, province: 'all' });
  };

  const handleProvinceChange = (prov) => {
    setSelectedProvince(prov);
    updateUrl({ province: prov });
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    updateUrl({ category: cat });
  };

  const handleRatingChange = (rat) => {
    setMinRating(rat);
    updateUrl({ rating: rat });
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    updateUrl({ q: val });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedRegion('all');
    setSelectedProvince('all');
    setSelectedCategory('all');
    setMinRating('all');
    setSortBy('rating');
    setSearchParams({});
  };

  // Provinces available filtered by selected region
  const availableProvinces = useMemo(() => {
    if (selectedRegion === 'all') return provincesData;
    return provincesData.filter((p) => p.region === selectedRegion);
  }, [selectedRegion, provincesData]);

  // Regions list (strictly 4 regions)
  const regionsList = ['all', 'north', 'central', 'northeast', 'south'];

  // Filter & Sort Destinations
  const filteredDestinations = useMemo(() => {
    return destinations
      .filter((item) => {
        // Text Search across th, en, zh names, descriptions, and province names
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const matchTh = item.name?.th?.toLowerCase().includes(q) || item.description?.th?.toLowerCase().includes(q);
          const matchEn = item.name?.en?.toLowerCase().includes(q) || item.description?.en?.toLowerCase().includes(q);
          const matchZh = item.name?.zh?.toLowerCase().includes(q) || item.description?.zh?.toLowerCase().includes(q);
          const matchProv = item.province?.toLowerCase().includes(q);
          const matchCat = item.category?.toLowerCase().includes(q);
          if (!matchTh && !matchEn && !matchZh && !matchProv && !matchCat) {
            return false;
          }
        }

        // Region Filter
        if (selectedRegion !== 'all' && item.region !== selectedRegion) {
          return false;
        }

        // Province Filter
        if (selectedProvince !== 'all' && item.province !== selectedProvince) {
          return false;
        }

        // Category Filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }

        // Min Rating Filter
        if (minRating !== 'all') {
          const min = parseFloat(minRating);
          if (Number(item.rating || 0) < min) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return Number(b.rating || 0) - Number(a.rating || 0);
        }
        if (sortBy === 'name') {
          const nameA = getLocalized(a.name).toLowerCase();
          const nameB = getLocalized(b.name).toLowerCase();
          return nameA.localeCompare(nameB, lang);
        }
        return 0;
      });
  }, [
    destinations,
    searchTerm,
    selectedRegion,
    selectedProvince,
    selectedCategory,
    minRating,
    sortBy,
    lang,
    getLocalized,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('discover.title')}
        </h1>
        <p className="text-slate-500 text-sm md:text-base">
          {t('discover.subtitle')}
        </p>
      </div>

      {/* Search & Filter Bar Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-5">
        {/* Top Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            id="discover-search-input"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t('discover.searchPlaceholder')}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm md:text-base text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Region Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('discover.regionLabel')}</span>
            </label>
            <select
              id="filter-region-select"
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {regionsList.map((reg) => (
                <option key={reg} value={reg}>
                  {reg === 'all' ? t('regions.all') : getRegionName(reg)}
                </option>
              ))}
            </select>
          </div>

          {/* Province Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('discover.provinceLabel')}</span>
            </label>
            <select
              id="filter-province-select"
              value={selectedProvince}
              onChange={(e) => handleProvinceChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">{t('discover.allProvinces')}</option>
              {availableProvinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {getProvinceName(p.id)}
                </option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('discover.categoryLabel')}</span>
            </label>
            <select
              id="filter-category-select"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">{t('discover.allCategories')}</option>
              {categoriesData.map((c) => (
                <option key={c.id} value={c.id}>
                  {getCategoryName(c.id)}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Rating Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('discover.ratingLabel')}</span>
            </label>
            <select
              id="filter-rating-select"
              value={minRating}
              onChange={(e) => handleRatingChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">{t('discover.allRatings')}</option>
              <option value="4.5">★ 4.5+</option>
              <option value="4.7">★ 4.7+</option>
              <option value="4.8">★ 4.8+</option>
              <option value="4.9">★ 4.9+</option>
            </select>
          </div>
        </div>

        {/* Results Bar & Sort Options */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
          <div className="font-semibold text-slate-700">
            {t('discover.foundResults', { count: filteredDestinations.length })}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('discover.sortByLabel')}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-slate-900 border-none focus:outline-hidden cursor-pointer"
              >
                <option value="rating">{t('discover.sortRatingDesc')}</option>
                <option value="name">{t('discover.sortNameAsc')}</option>
              </select>
            </div>

            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-700 px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('discover.clearFilters')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Destinations Results Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">{t('common.loading')}</div>
      ) : filteredDestinations.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-300 space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">{t('discover.noResults')}</h3>
          <p className="text-xs text-slate-500">{t('discover.tryDifferent')}</p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            {t('discover.clearFilters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredDestinations.map((dest) => (
            <DestinationCard
              key={dest.id}
              destination={dest}
              onLoginPrompt={login}
            />
          ))}
        </div>
      )}
    </div>
  );
}
