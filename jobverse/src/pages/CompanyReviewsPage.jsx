import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, ThumbsDown, User, Briefcase, Calendar } from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations';
import { LoadingSpinner, EmptyState } from '../components';

const CompanyReviewsPage = () => {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    pros: '',
    cons: '',
    isCurrentEmployee: false,
    jobTitle: ''
  });

  useEffect(() => {
    fetchCompanyAndReviews();
  }, [companyId]);

  const fetchCompanyAndReviews = async () => {
    try {
      setLoading(true);

      // Fetch company details
      const companyRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/v1/companies/${companyId}`);
      if (companyRes.ok) {
        const companyData = await companyRes.json();
        setCompany(companyData.data);
      }

      // Fetch reviews
      const reviewsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/v1/company-reviews/company/${companyId}`);
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.data.content || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/v1/company-reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          companyId: parseInt(companyId)
        })
      });

      if (response.ok) {
        setShowReviewForm(false);
        setFormData({
          rating: 5,
          title: '',
          pros: '',
          cons: '',
          isCurrentEmployee: false,
          jobTitle: ''
        });
        fetchCompanyAndReviews();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Company Header */}
        <motion.div {...fadeInUp} className="glass-card p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              {company?.logoUrl && (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{company?.name}</h1>
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-2">
                    {renderStars(Math.round(company?.ratingAvg || 0))}
                    <span className="text-lg font-semibold text-white">
                      {company?.ratingAvg?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  <span>({company?.reviewCount || 0} đánh giá)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="btn-primary"
            >
              Viết đánh giá
            </button>
          </div>
        </motion.div>

        {/* Review Form */}
        {showReviewForm && (
          <motion.div {...fadeInUp} className="glass-card p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Viết đánh giá</h2>

            <form onSubmit={handleSubmitReview} className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-gray-300 mb-2">Đánh giá *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-gray-300 mb-2">Tiêu đề</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="Tóm tắt trải nghiệm của bạn"
                  maxLength={200}
                />
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-gray-300 mb-2">Vị trí công việc</label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="input-field"
                  placeholder="Ví dụ: Senior Backend Developer"
                />
              </div>

              {/* Current Employee */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="currentEmployee"
                  checked={formData.isCurrentEmployee}
                  onChange={(e) => setFormData({ ...formData, isCurrentEmployee: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="currentEmployee" className="text-gray-300">
                  Tôi hiện đang làm việc tại đây
                </label>
              </div>

              {/* Pros */}
              <div>
                <label className="block text-gray-300 mb-2">Ưu điểm *</label>
                <textarea
                  value={formData.pros}
                  onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
                  className="input-field h-32"
                  placeholder="Những điểm tốt khi làm việc tại đây..."
                  required
                  maxLength={2000}
                />
              </div>

              {/* Cons */}
              <div>
                <label className="block text-gray-300 mb-2">Nhược điểm</label>
                <textarea
                  value={formData.cons}
                  onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
                  className="input-field h-32"
                  placeholder="Những điểm cần cải thiện..."
                  maxLength={2000}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button type="submit" className="btn-primary">
                  Gửi đánh giá
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="btn-secondary"
                >
                  Hủy
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <EmptyState
            icon={Star}
            title="Chưa có đánh giá"
            message="Hãy là người đầu tiên đánh giá công ty này"
          />
        ) : (
          <motion.div {...staggerContainer} className="space-y-6">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                {...staggerItem}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        {renderStars(review.rating)}
                        {review.isCurrentEmployee && (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                            Nhân viên hiện tại
                          </span>
                        )}
                      </div>
                      {review.jobTitle && (
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Briefcase className="w-4 h-4" />
                          {review.jobTitle}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(review.createdAt), 'dd/MM/yyyy')}
                      </div>
                    </div>
                  </div>
                </div>

                {review.title && (
                  <h3 className="text-lg font-semibold text-white mb-3">{review.title}</h3>
                )}

                <div className="space-y-4">
                  {review.pros && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ThumbsUp className="w-5 h-5 text-green-400" />
                        <span className="font-semibold text-green-400">Ưu điểm</span>
                      </div>
                      <p className="text-gray-300 ml-7">{review.pros}</p>
                    </div>
                  )}

                  {review.cons && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ThumbsDown className="w-5 h-5 text-red-400" />
                        <span className="font-semibold text-red-400">Nhược điểm</span>
                      </div>
                      <p className="text-gray-300 ml-7">{review.cons}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CompanyReviewsPage;
