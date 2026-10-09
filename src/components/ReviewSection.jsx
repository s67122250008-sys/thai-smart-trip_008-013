import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchDestinationReviews,
  addReview,
  deleteReview,
} from '../services/firebase.js';
import { Star, Trash2, Send, MessageSquarePlus, CheckCircle, AlertCircle } from 'lucide-react';

export default function ReviewSection({ destinationId, destinationName, onLoginPrompt }) {
  const { t } = useLanguage();
  const { user, isAdmin } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchDestinationReviews(destinationId);
      setReviews(data);
    } catch (err) {
      console.warn('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [destinationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      if (onLoginPrompt) onLoginPrompt();
      return;
    }
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const newRev = await addReview({
        userId: user.uid,
        userDisplayName: user.displayName || 'Traveler',
        userPhotoURL: user.photoURL || '',
        destinationId,
        rating,
        comment,
      });

      if (newRev) {
        setReviews((prev) => [newRev, ...prev]);
        setComment('');
        setRating(5);
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3000);
      }
    } catch (err) {
      console.error('Error adding review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  // Average rating calculated from loaded reviews
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div id="reviews-section" className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{t('detail.reviewsTitle')}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              {reviews.length}
            </span>
          </h3>
          {avgRating && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(Number(avgRating)) ? 'fill-current' : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-900">{avgRating} / 5.0</span>
            </div>
          )}
        </div>
      </div>

      {/* Review Submission Form */}
      <div className="my-6 p-5 rounded-xl bg-slate-50/80 border border-slate-200/80">
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <img
                  src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-500/20"
                />
                <span className="text-sm font-semibold text-slate-900">
                  {user.displayName}
                </span>
              </div>

              {/* Star Picker */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 mr-1">{t('detail.reviewScore')}:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-0.5 cursor-pointer text-slate-300 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400 fill-current'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <textarea
                id="review-comment-input"
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('detail.reviewCommentPlaceholder')}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between">
              {successMsg ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Review submitted!
                </span>
              ) : <span />}

              <button
                type="submit"
                id="submit-review-btn"
                disabled={submitting || !comment.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? t('detail.submittingReview') : t('detail.submitReview')}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4 space-y-2">
            <MessageSquarePlus className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-medium text-slate-700">
              Want to share your experience at {destinationName}?
            </p>
            <button
              id="login-to-review-btn"
              onClick={onLoginPrompt}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-100/60 hover:bg-emerald-100 px-4 py-2 rounded-full transition-colors cursor-pointer"
            >
              Sign in with Google to write a review
            </button>
          </div>
        )}
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-sm text-slate-400">
            {t('common.loading')}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-500">{t('detail.noReviews')}</p>
          </div>
        ) : (
          reviews.map((rev) => {
            const canDelete = isAdmin || (user && user.uid === rev.userId);
            const dateStr = rev.createdAt
              ? new Date(rev.createdAt).toLocaleDateString()
              : '';

            return (
              <div
                key={rev.id}
                id={`review-item-${rev.id}`}
                className="p-4 rounded-xl bg-white border border-slate-100 hover:border-slate-200 shadow-2xs transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        rev.userPhotoURL ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
                      }
                      alt={rev.userDisplayName}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {rev.userDisplayName}
                      </h4>
                      <p className="text-[10px] text-slate-400">{dateStr}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= Number(rev.rating || 5)
                              ? 'fill-current text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    {canDelete && (
                      <button
                        id={`delete-rev-btn-${rev.id}`}
                        onClick={() => handleDelete(rev.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed pl-11">
                  {rev.comment}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
