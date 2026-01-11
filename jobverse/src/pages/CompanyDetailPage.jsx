// src/pages/CompanyDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Globe, Users, Star, Building2, Calendar, Briefcase,
  ArrowLeft, ExternalLink, ChevronRight, ThumbsUp, ThumbsDown, User
} from 'lucide-react';
import { companiesAPI, jobsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Navbar, Footer, JobCard, LoadingSpinner, EmptyState } from '../components';
import AnimatedBackground from '../components/AnimatedBackground';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations';
import toast from 'react-hot-toast';

const CompanyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewEligibility, setReviewEligibility] = useState({ canReview: false, hasApplied: false, hasReviewed: false });
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    title: '',
    pros: '',
    cons: '',
    isCurrentEmployee: false,
    jobTitle: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  const isCandidate = user?.role === 'CANDIDATE';

  useEffect(() => {
    fetchCompanyData();
  }, [id]);

  // Fetch saved/applied jobs for candidates when authenticated
  useEffect(() => {
    if (isAuthenticated && isCandidate) {
      fetchSavedAndAppliedJobs();
    }
  }, [isAuthenticated, user?.role]);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      const [companyRes, jobsRes, reviewsRes] = await Promise.all([
        companiesAPI.getCompanyById(id),
        jobsAPI.getJobsByCompany(id),
        companiesAPI.getCompanyReviews(id).catch(() => ({ data: { content: [] } })),
      ]);
      
      setCompany(companyRes.data);
      
      // Handle different response formats
      const jobsData = jobsRes.data?.content || jobsRes.data || [];
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      
      // Set reviews
      const reviewsData = reviewsRes.data?.content || reviewsRes.data || [];
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check review eligibility when authenticated
  const checkReviewEligibility = async () => {
    if (!isAuthenticated || !isCandidate) return;
    try {
      const res = await companiesAPI.checkReviewEligibility(id);
      setReviewEligibility(res.data || { canReview: false, hasApplied: false, hasReviewed: false });
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isCandidate) {
      checkReviewEligibility();
    }
  }, [isAuthenticated, user?.role, id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewFormData.pros.trim()) {
      toast.error('Vui lòng nhập ưu điểm của công ty');
      return;
    }
    
    setSubmittingReview(true);
    try {
      await companiesAPI.submitReview({
        ...reviewFormData,
        companyId: parseInt(id)
      });
      toast.success('Đánh giá của bạn đã được gửi thành công!');
      setShowReviewForm(false);
      setReviewFormData({
        rating: 5,
        title: '',
        pros: '',
        cons: '',
        isCurrentEmployee: false,
        jobTitle: ''
      });
      // Refresh data
      fetchCompanyData();
      checkReviewEligibility();
    } catch (error) {
      toast.error(error.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setReviewFormData({ ...reviewFormData, rating: star })}
            className={interactive ? "transition-transform hover:scale-110" : ""}
          >
            <Star
              className={`w-5 h-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
            />
          </button>
        ))}
      </div>
    );
  };

  // Hydrate saved/applied state from backend
  const fetchSavedAndAppliedJobs = async () => {
    try {
      const [savedRes, appliedRes] = await Promise.all([
        jobsAPI.getSavedJobs().catch(() => ({ data: [] })),
        jobsAPI.getMyApplications().catch(() => ({ data: [] })),
      ]);

      // Parse saved jobs
      const savedData = savedRes.data?.content || savedRes.data || [];
      const savedIds = Array.isArray(savedData) ? savedData.map(job => job.id) : [];
      setSavedJobs(new Set(savedIds));

      // Parse applied jobs
      const appliedData = appliedRes.data || [];
      const appliedIds = Array.isArray(appliedData) ? appliedData.map(app => app.jobId) : [];
      setAppliedJobs(new Set(appliedIds));
    } catch (error) {
      console.error('Error fetching saved/applied jobs:', error);
    }
  };

  const toggleSaveJob = async (jobId) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu việc làm');
      navigate('/login');
      return;
    }

    try {
      const newSaved = new Set(savedJobs);
      if (newSaved.has(jobId)) {
        await jobsAPI.unsaveJob(jobId);
        newSaved.delete(jobId);
        toast.success('Đã bỏ lưu việc làm');
      } else {
        await jobsAPI.saveJob(jobId);
        newSaved.add(jobId);
        toast.success('Đã lưu việc làm');
      }
      setSavedJobs(newSaved);
    } catch (error) {
      console.error('Error toggling save job:', error);
      toast.error('Lỗi: ' + (error.message || 'Không thể lưu việc làm'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-gray-100">
        <Navbar />
        <div className="pt-24"><LoadingSpinner size="lg" /></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-gray-100">
        <Navbar />
        <div className="pt-24 text-center">
          <h1 className="text-2xl font-bold text-white">Không tìm thấy công ty</h1>
          <Link to="/companies" className="btn-primary mt-4 inline-block">Quay lại danh sách</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0b]' : 'bg-slate-50'} text-gray-100 transition-colors duration-500`}>
      <AnimatedBackground />
      <Navbar />
      
      <main className="pt-20 pb-16">
        {/* Cover Image */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-violet-600/30 to-indigo-600/30 relative">
          {company.coverUrl && (
            <img src={company.coverUrl} alt="" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
          {/* Company Header */}
          <div className="glass-card rounded-2xl p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-5xl flex-shrink-0 border-4 border-gray-900">
                {company.logoUrl ? (
                  <img src={company.logoUrl} alt={company.name} className="w-20 h-20 object-contain" />
                ) : (
                  '🏢'
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {company.isVerified && (
                    <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                      ✓ Đã xác minh
                    </span>
                  )}
                  {company.isFeatured && (
                    <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                      ⭐ Nổi bật
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{company.name}</h1>
                <p className="text-gray-400 mb-4">{company.industry}</p>
                
                <div className="flex flex-wrap gap-4 text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {company.headquarters || company.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> {company.employeeCount || '100+'} nhân viên
                  </span>
                  {company.ratingAvg && (
                    <span className="flex items-center gap-1.5 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" /> {company.ratingAvg} ({company.reviewCount} đánh giá)
                    </span>
                  )}
                  {company.website && (
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300"
                    >
                      <Globe className="w-4 h-4" /> Website <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-center px-4 py-2 glass-card rounded-xl">
                  <span className="text-2xl font-bold text-violet-400">{jobs.length}</span>
                  <span className="text-sm text-gray-400 block">Việc làm</span>
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['overview', 'jobs', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-violet-500 text-white'
                    : 'glass-card text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'overview' && 'Tổng quan'}
                {tab === 'jobs' && `Việc làm (${jobs.length})`}
                {tab === 'reviews' && `Đánh giá (${reviews.length})`}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Giới thiệu công ty</h2>
                    <div className="prose prose-invert max-w-none text-gray-300">
                      {company.description ? (
                        company.description.split('\n').map((line, i) => (
                          <p key={i} className="mb-3">{line}</p>
                        ))
                      ) : (
                        <p>Chưa có thông tin mô tả về công ty này.</p>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-card rounded-xl p-4 text-center">
                      <Building2 className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                      <p className="text-lg font-bold text-white">{company.companySize || 'N/A'}</p>
                      <p className="text-xs text-gray-400">Quy mô</p>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                      <Calendar className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                      <p className="text-lg font-bold text-white">{company.foundedYear || 'N/A'}</p>
                      <p className="text-xs text-gray-400">Năm thành lập</p>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                      <Briefcase className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                      <p className="text-lg font-bold text-white">{jobs.length}</p>
                      <p className="text-xs text-gray-400">Việc làm</p>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                      <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <p className="text-lg font-bold text-white">{company.ratingAvg || 'N/A'}</p>
                      <p className="text-xs text-gray-400">Đánh giá</p>
                    </div>
                  </div>

                  {/* Recent Jobs Preview */}
                  {jobs.length > 0 && (
                    <div className="glass-card rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-white">Việc làm mới nhất</h2>
                        <button 
                          onClick={() => setActiveTab('jobs')}
                          className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1"
                        >
                          Xem tất cả <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        {jobs.slice(0, 3).map(job => (
                          <Link
                            key={job.id}
                            to={`/jobs/${job.id}`}
                            className="block p-4 rounded-xl hover:bg-gray-800/50 transition-colors"
                          >
                            <h3 className="font-medium text-white mb-1">{job.title}</h3>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                              <span>{job.location}</span>
                              <span>
                                {job.salaryMin && job.salaryMax 
                                  ? `${(job.salaryMin/1000000).toFixed(0)}-${(job.salaryMax/1000000).toFixed(0)} triệu`
                                  : 'Thỏa thuận'}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Jobs Tab */}
              {activeTab === 'jobs' && (
                <div className="space-y-4">
                  {jobs.length > 0 ? (
                    jobs.map(job => (
                      <JobCard 
                        key={job.id} 
                        job={{...job, company}}
                        onSave={toggleSaveJob}
                        isSaved={savedJobs.has(job.id)}
                        isApplied={appliedJobs.has(job.id)}
                        userRole={user?.role}
                      />
                    ))
                  ) : (
                    <EmptyState
                      icon={Briefcase}
                      title="Chưa có tin tuyển dụng"
                      description="Công ty này hiện chưa đăng tin tuyển dụng nào"
                    />
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Review Form */}
                  {isAuthenticated && isCandidate && (
                    <div className="glass-card rounded-2xl p-6">
                      {reviewEligibility.hasReviewed ? (
                        <div className="text-center text-gray-400">
                          <Star className="w-12 h-12 mx-auto mb-2 text-yellow-400" />
                          <p>Bạn đã đánh giá công ty này rồi</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Viết đánh giá</h3>
                            <button
                              onClick={() => setShowReviewForm(!showReviewForm)}
                              className="btn-primary text-sm"
                            >
                              {showReviewForm ? 'Hủy' : 'Viết đánh giá'}
                            </button>
                          </div>
                          
                          {showReviewForm && (
                            <form onSubmit={handleSubmitReview} className="space-y-4">
                              {/* Rating */}
                              <div>
                                <label className="block text-gray-300 mb-2">Đánh giá *</label>
                                {renderStars(reviewFormData.rating, true)}
                              </div>
                              
                              {/* Title */}
                              <div>
                                <label className="block text-gray-300 mb-2">Tiêu đề</label>
                                <input
                                  type="text"
                                  value={reviewFormData.title}
                                  onChange={(e) => setReviewFormData({ ...reviewFormData, title: e.target.value })}
                                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white"
                                  placeholder="Tóm tắt trải nghiệm của bạn"
                                  maxLength={200}
                                />
                              </div>
                              
                              {/* Job Title */}
                              <div>
                                <label className="block text-gray-300 mb-2">Vị trí công việc</label>
                                <input
                                  type="text"
                                  value={reviewFormData.jobTitle}
                                  onChange={(e) => setReviewFormData({ ...reviewFormData, jobTitle: e.target.value })}
                                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white"
                                  placeholder="Ví dụ: Senior Backend Developer"
                                />
                              </div>
                              
                              {/* Current Employee */}
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="currentEmployee"
                                  checked={reviewFormData.isCurrentEmployee}
                                  onChange={(e) => setReviewFormData({ ...reviewFormData, isCurrentEmployee: e.target.checked })}
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
                                  value={reviewFormData.pros}
                                  onChange={(e) => setReviewFormData({ ...reviewFormData, pros: e.target.value })}
                                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white h-24"
                                  placeholder="Những điểm tốt khi làm việc tại đây..."
                                  required
                                  maxLength={2000}
                                />
                              </div>
                              
                              {/* Cons */}
                              <div>
                                <label className="block text-gray-300 mb-2">Nhược điểm</label>
                                <textarea
                                  value={reviewFormData.cons}
                                  onChange={(e) => setReviewFormData({ ...reviewFormData, cons: e.target.value })}
                                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white h-24"
                                  placeholder="Những điểm cần cải thiện..."
                                  maxLength={2000}
                                />
                              </div>
                              
                              <button 
                                type="submit" 
                                disabled={submittingReview}
                                className="btn-primary w-full"
                              >
                                {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                              </button>
                            </form>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  
                  {!isAuthenticated && (
                    <div className="glass-card rounded-2xl p-6 text-center">
                      <User className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                      <p className="text-gray-400 mb-2">Đăng nhập để viết đánh giá</p>
                      <Link to="/login" className="text-violet-400 hover:text-violet-300">
                        Đăng nhập →
                      </Link>
                    </div>
                  )}
                  
                  {isAuthenticated && !isCandidate && (
                    <div className="glass-card rounded-2xl p-6 text-center">
                      <User className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                      <p className="text-gray-400">Chỉ ứng viên mới có thể viết đánh giá</p>
                    </div>
                  )}
                  
                  {/* Reviews List */}
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="glass-card rounded-2xl p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <Link 
                              to={`/profile/${review.userId}`}
                              className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0 overflow-hidden hover:ring-2 hover:ring-violet-400 transition-all"
                            >
                              {review.userAvatar ? (
                                <img src={review.userAvatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-6 h-6 text-white" />
                              )}
                            </Link>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                {renderStars(review.rating)}
                                {review.isCurrentEmployee && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                                    Nhân viên hiện tại
                                  </span>
                                )}
                              </div>
                              <Link 
                                to={`/profile/${review.userId}`}
                                className="text-white font-medium hover:text-violet-400 transition-colors"
                              >
                                {review.userName || 'Ẩn danh'}
                              </Link>
                              {review.jobTitle && (
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                  <Briefcase className="w-4 h-4" />
                                  {review.jobTitle}
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                                <Calendar className="w-4 h-4" />
                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : ''}
                              </div>
                            </div>
                          </div>
                          
                          {review.title && (
                            <h4 className="text-lg font-semibold text-white mb-3">{review.title}</h4>
                          )}
                          
                          <div className="space-y-3">
                            {review.pros && (
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <ThumbsUp className="w-4 h-4 text-green-400" />
                                  <span className="font-medium text-green-400">Ưu điểm</span>
                                </div>
                                <p className="text-gray-300 ml-6">{review.pros}</p>
                              </div>
                            )}
                            
                            {review.cons && (
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <ThumbsDown className="w-4 h-4 text-red-400" />
                                  <span className="font-medium text-red-400">Nhược điểm</span>
                                </div>
                                <p className="text-gray-300 ml-6">{review.cons}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="glass-card rounded-2xl p-6">
                      <EmptyState
                        icon={Star}
                        title="Chưa có đánh giá"
                        description="Hãy là người đầu tiên đánh giá công ty này."
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-semibold text-white mb-4">Thông tin liên hệ</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Địa chỉ</p>
                    <p className="text-white">{company.headquarters || company.location || 'Chưa cập nhật'}</p>
                  </div>
                  {company.website && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Website</p>
                      <a 
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-400 hover:text-violet-300 break-all"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Apply */}
              <div className="glass-card rounded-2xl p-6 text-center">
                <h3 className="font-semibold text-white mb-2">Quan tâm đến công ty này?</h3>
                <p className="text-sm text-gray-400 mb-4">Xem các vị trí đang tuyển dụng</p>
                <button 
                  onClick={() => setActiveTab('jobs')}
                  className="btn-primary w-full"
                >
                  Xem {jobs.length} việc làm
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CompanyDetailPage;
