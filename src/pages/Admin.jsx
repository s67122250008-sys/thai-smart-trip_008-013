import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  fetchAllReviews,
  deleteReview,
  fetchAdminStats,
  seedInitialDestinationsToFirestore,
} from '../services/firebase.js';
import { compressImage, isImageFile, MAX_IMAGE_BYTES } from '../utils/imageUpload.js';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Database,
  MapPin,
  Star,
  Users,
  MessageSquare,
  Compass,
  CheckCircle,
  X,
  Search,
  ExternalLink,
  ImagePlus,
  Upload,
} from 'lucide-react';

const emptyForm = {
  id: '',
  nameTh: '',
  nameEn: '',
  nameZh: '',
  province: 'bangkok',
  region: 'central',
  category: 'temple',
  descriptionTh: '',
  descriptionEn: '',
  descriptionZh: '',
  image: '',
  rating: 4.8,
  mapsUrl: '',
};

export default function Admin() {
  const { t, getLocalized, getProvinceName, getCategoryName, getRegionName, provincesData, categoriesData } = useLanguage();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('destinations'); // 'destinations' | 'reviews' | 'seed'
  const [stats, setStats] = useState({ totalDestinations: 0, totalUsers: 0, totalReviews: 0 });
  const [destinations, setDestinations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form / Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Search filter inside admin
  const [adminSearch, setAdminSearch] = useState('');

  // Seeding feedback
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [destList, revList, statData] = await Promise.all([
        fetchDestinations(),
        fetchAllReviews(),
        fetchAdminStats(),
      ]);
      setDestinations(destList);
      setReviews(revList);
      setStats(statData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-400">
        {t('common.loading')}
      </div>
    );
  }

  // Admin Role Protection Guard
  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
          <Shield className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">
            {t('admin.accessDenied')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            You must be logged in as an authorized Administrator to access this control portal.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 cursor-pointer"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setImageFile(null);
    setImagePreview('');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (dest) => {
    setIsEditing(true);
    setFormData({
      id: dest.id,
      nameTh: dest.name?.th || '',
      nameEn: dest.name?.en || '',
      nameZh: dest.name?.zh || '',
      province: dest.province || 'bangkok',
      region: dest.region || 'central',
      category: dest.category || 'temple',
      descriptionTh: dest.description?.th || '',
      descriptionEn: dest.description?.en || '',
      descriptionZh: dest.description?.zh || '',
      image: dest.image || '',
      rating: dest.rating || 4.8,
      mapsUrl: dest.mapsUrl || '',
    });
    setImageFile(null);
    setImagePreview(dest.image || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setFormError('');

    if (!isImageFile(file)) {
      setFormError(t('admin.form.imageTypeError'));
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setFormError(t('admin.form.imageSizeError'));
      return;
    }

    try {
      const dataUrl = await compressImage(file);
      setImageFile(file);
      setImagePreview(dataUrl);
      setFormData((prev) => ({ ...prev, image: dataUrl }));
    } catch (err) {
      console.error('Image compression failed:', err);
      setFormError(t('admin.form.imageTypeError'));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!isEditing && !formData.image) {
      setFormError(t('admin.form.imageRequired'));
      return;
    }

    setFormSubmitting(true);

    try {
      const destinationPayload = {
        id: formData.id.trim().toLowerCase().replace(/\s+/g, '-'),
        name: {
          th: formData.nameTh.trim(),
          en: formData.nameEn.trim(),
          zh: formData.nameZh.trim(),
        },
        province: formData.province,
        region: formData.region,
        category: formData.category,
        description: {
          th: formData.descriptionTh.trim(),
          en: formData.descriptionEn.trim(),
          zh: formData.descriptionZh.trim(),
        },
        image: formData.image.trim(),
        rating: Number(formData.rating) || 4.5,
        mapsUrl: formData.mapsUrl.trim(),
      };

      if (isEditing) {
        await updateDestination(destinationPayload.id, destinationPayload);
      } else {
        await createDestination(destinationPayload);
      }

      setModalOpen(false);
      await loadAdminData();
    } catch (err) {
      setFormError(err.message || 'Failed to save destination');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteDestination = async (destId) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;
    try {
      await deleteDestination(destId);
      setDestinations((prev) => prev.filter((d) => d.id !== destId));
    } catch (err) {
      console.error('Delete destination error:', err);
    }
  };

  const handleDeleteReview = async (revId) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await deleteReview(revId);
      setReviews((prev) => prev.filter((r) => r.id !== revId));
    } catch (err) {
      console.error('Delete review error:', err);
    }
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setSeedSuccess(false);
    try {
      await seedInitialDestinationsToFirestore();
      setSeedSuccess(true);
      await loadAdminData();
      setTimeout(() => setSeedSuccess(false), 4000);
    } catch (err) {
      console.error('Seeding error:', err);
    } finally {
      setSeeding(false);
    }
  };

  const filteredDestinations = destinations.filter((d) => {
    const q = adminSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      d.id.toLowerCase().includes(q) ||
      d.name?.th?.toLowerCase().includes(q) ||
      d.name?.en?.toLowerCase().includes(q) ||
      d.province?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100/70 border border-amber-200 px-3 py-1 rounded-full mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Control Panel</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('admin.title')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t('admin.subtitle')}
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          id="admin-add-dest-btn"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('admin.addNewDestination')}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">
              {stats.totalDestinations || destinations.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {t('admin.statsDestinations')}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">
              {stats.totalUsers}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {t('admin.statsUsers')}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block">
              {stats.totalReviews || reviews.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {t('admin.statsReviews')}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab('destinations')}
            id="admin-tab-destinations"
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'destinations'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{t('admin.tabDestinations')} ({destinations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            id="admin-tab-reviews"
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t('admin.tabReviews')} ({reviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('seed')}
            id="admin-tab-seed"
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'seed'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{t('admin.tabSeed')}</span>
          </button>
        </div>

        {/* Tab 1: Manage Destinations */}
        {activeTab === 'destinations' && (
          <div className="space-y-4">
            {/* Search filter in admin */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Search by ID, name, or province..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Destination</th>
                      <th className="p-4">Province & Region</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDestinations.map((dest) => (
                      <tr key={dest.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={dest.image || 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=100&q=80'}
                              alt={dest.id}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block text-xs">
                                {dest.name?.th || dest.name?.en || dest.id}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                id: {dest.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-slate-800 block">
                            {getProvinceName(dest.province)}
                          </span>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {dest.region}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                            {getCategoryName(dest.category)}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-amber-600">
                          ★ {Number(dest.rating || 4.5).toFixed(1)}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(dest)}
                            id={`edit-dest-btn-${dest.id}`}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDestination(dest.id)}
                            id={`delete-dest-btn-${dest.id}`}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Manage Reviews */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Destination ID</th>
                    <th className="p-4">Rating & Comment</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={rev.userPhotoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                            alt={rev.userDisplayName}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <span className="font-semibold text-slate-900">
                            {rev.userDisplayName}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-emerald-700">
                        {rev.destinationId}
                      </td>
                      <td className="p-4 max-w-sm">
                        <div className="flex text-amber-400 mb-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= Number(rev.rating || 5) ? 'fill-current' : 'text-slate-200'}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">{rev.comment}</p>
                      </td>
                      <td className="p-4 text-[10px] text-slate-400">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ''}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Database Seeding */}
        {activeTab === 'seed' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs max-w-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {t('admin.seedTitle')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('admin.seedDescription')}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <p className="font-semibold text-slate-800">Seed Data Flow:</p>
              <div className="font-mono text-[11px] bg-white p-2.5 rounded-lg border border-slate-200">
                src/data/destinations.json ➔ Firestore destinations collection ➔ Dynamic Client
              </div>
              <p className="text-slate-500">
                After initialization, all subsequent CRUD operations happen directly in Firestore without needing to rewrite JSON files.
              </p>
            </div>

            {seedSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{t('admin.seedSuccess')}</span>
              </div>
            )}

            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              id="admin-run-seed-btn"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Database className="w-4 h-4" />
              <span>{seeding ? t('admin.seeding') : t('admin.seedButton')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Destination Form Modal (Create / Edit) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                {isEditing ? t('admin.editDestination') : t('admin.addNewDestination')}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* ID */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('admin.form.id')} *
                </label>
                <input
                  type="text"
                  required
                  disabled={isEditing}
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="e.g. doi-suthep"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 disabled:opacity-50"
                />
              </div>

              {/* Names (TH, EN, ZH) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t('admin.form.nameTh')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameTh}
                    onChange={(e) => setFormData({ ...formData, nameTh: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t('admin.form.nameEn')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t('admin.form.nameZh')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameZh}
                    onChange={(e) => setFormData({ ...formData, nameZh: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
              </div>

              {/* Province, Region, Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t('admin.form.province')}
                  </label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 cursor-pointer"
                  >
                    {provincesData.map((p) => (
                      <option key={p.id} value={p.id}>
                        {getProvinceName(p.id)} ({p.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t('admin.form.region')}
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 cursor-pointer"
                  >
                    {['north', 'central', 'northeast', 'south'].map((r) => (
                      <option key={r} value={r}>
                        {getRegionName(r)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t('admin.form.category')}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 cursor-pointer"
                  >
                    {categoriesData.map((c) => (
                      <option key={c.id} value={c.id}>
                        {getCategoryName(c.id)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Descriptions (TH, EN, ZH) */}
              <div className="space-y-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t('admin.form.descriptionTh')} *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.descriptionTh}
                    onChange={(e) => setFormData({ ...formData, descriptionTh: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t('admin.form.descriptionEn')} *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t('admin.form.descriptionZh')} *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.descriptionZh}
                    onChange={(e) => setFormData({ ...formData, descriptionZh: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
              </div>

              {/* Image upload, Rating, Maps URL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t('admin.form.image')} {!isEditing && '*'}
                    {isEditing && (
                      <span className="text-[10px] font-normal text-slate-400 ml-1">
                        ({t('admin.form.imageOptional')})
                      </span>
                    )}
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImagePlus className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>{t('admin.form.imageUpload')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-slate-400">
                        {imageFile ? imageFile.name : t('admin.form.imageHint')}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {t('admin.form.rating')} (1.0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('admin.form.mapsUrl')} *
                </label>
                <input
                  type="url"
                  required
                  value={formData.mapsUrl}
                  onChange={(e) => setFormData({ ...formData, mapsUrl: e.target.value })}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  {t('admin.form.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {formSubmitting ? t('admin.form.saving') : t('admin.form.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
