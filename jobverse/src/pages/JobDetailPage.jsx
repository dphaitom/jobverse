// src/pages/JobDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, DollarSign, Briefcase, Clock, Globe, Users, Building2,
  Heart, Share2, ArrowLeft, CheckCircle, Star, Zap, Calendar,
  Send, BookOpen, Award, ChevronRight, MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsAPI, chatAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Navbar, Footer, LoadingSpinner, JobCard } from '../components';
import { fadeInUp, slideInRight, staggerContainer, staggerItem, scaleIn } from '../utils/animations';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [quickApplyLoading, setQuickApplyLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    fetchJobDetail();
  }, [id, isAuthenticated]);

  const fetchJobDetail = async () => {
    setLoading(true);
    try {
      const response = await jobsAPI.getJobById(id);
      setJob(response.data);

      // Fetch related jobs
      if (response.data?.company?.id) {
        try {
          const relatedRes = await jobsAPI.getJobsByCompany(response.data.company.id);
          // Handle both array and Page object formats
          const relatedData = relatedRes.data?.content || relatedRes.data || [];
          const relatedArray = Array.isArray(relatedData) ? relatedData : [];
          setRelatedJobs(relatedArray.filter(j => j.id !== parseInt(id)).slice(0, 3));
        } catch (err) {
          console.error('Error fetching related jobs:', err);
          setRelatedJobs([]);
        }
      }

      // Check if job is saved and applied (only for authenticated users)
      if (isAuthenticated && user?.role === 'CANDIDATE') {
        try {
          const [savedRes, appliedRes] = await Promise.all([
            jobsAPI.checkSavedJob(id).catch((err) => {
              console.error('checkSavedJob error:', err);
              return { data: { isSaved: false } };
            }),
            jobsAPI.checkApplied(id).catch((err) => {
              console.error('checkApplied error:', err);
              return { data: { hasApplied: false } };
            }),
          ]);
          console.log('Check saved response:', savedRes);
          console.log('Check applied response:', appliedRes);

          // Handle various response formats: { data: { isSaved } }, { isSaved }, or direct boolean
          const savedData = savedRes?.data ?? savedRes;
          const appliedData = appliedRes?.data ?? appliedRes;

          const isSavedValue = savedData?.isSaved ?? savedData?.saved ?? false;
          const hasAppliedValue = appliedData?.hasApplied ?? false;

          console.log('Parsed isSaved:', isSavedValue, 'hasApplied:', hasAppliedValue);

          setIsSaved(isSavedValue);
          setHasApplied(hasAppliedValue);
        } catch (error) {
          console.error('Error checking saved/applied status:', error);
          setIsSaved(false);
          setHasApplied(false);
        }
      }
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      if (isSaved) {
        await jobsAPI.unsaveJob(id);
        toast.success('Đã bỏ lưu công việc');
      } else {
        await jobsAPI.saveJob(id);
        toast.success('✓ Đã lưu công việc thành công!');
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Lỗi khi lưu công việc: ' + (error.response?.data?.error?.message || error.message));
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setApplyLoading(true);
    try {
      await jobsAPI.applyJob({ 
        jobId: parseInt(id), 
        coverLetter: coverLetter || null,
      });
      setShowApplyModal(false);
      setHasApplied(true);
      toast.success('Ứng tuyển thành công! 🎉 Chúc bạn may mắn!');
    } catch (error) {
      toast.error('Lỗi: ' + (error.message || 'Không thể ứng tuyển'));
    } finally {
      setApplyLoading(false);
    }
  };

  const handleQuickApply = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setQuickApplyLoading(true);
    try {
      await jobsAPI.quickApply(parseInt(id));
      setHasApplied(true);
      toast.success('⚡ Ứng tuyển nhanh thành công! Chúc bạn may mắn!');
    } catch (error) {
      console.error('Quick apply error:', error);
      toast.error('Lỗi: ' + (error.message || 'Không thể ứng tuyển'));
    } finally {
      setQuickApplyLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!isAuthenticated || !job?.company?.id) return;
    
    try {
      // Create or get conversation with the company
      const response = await chatAPI.createOrGetConversation({
        companyId: job.company.id,
        jobId: parseInt(id),
      });
      
      const conversationId = response.data?.id;
      if (conversationId) {
        navigate(`/messages?conversation=${conversationId}`);
      } else {
        navigate('/messages');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Không thể bắt đầu cuộc trò chuyện');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `${job?.title} tại ${job?.company?.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã copy link! 📋');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-gray-100">
        <Navbar />
        <div className="pt-24">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-gray-100">
        <Navbar />
        <div className="pt-24 text-center">
          <h1 className="text-2xl font-bold text-white">Không tìm thấy việc làm</h1>
          <Link to="/jobs" className="inline-block mt-4 btn-primary">Quay lại danh sách</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-100">
      <Navbar />
      
      <main className="px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <motion.button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-6 text-gray-400 transition-colors hover:text-white"
            {...fadeInUp}
            transition={{ duration: 0.3 }}
            whileHover={{ x: -4 }}
          >
            <ArrowLeft className="w-5 h-5" /> Quay lại
          </motion.button>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              {/* Job Header */}
              <motion.div
                className="p-6 glass-card rounded-2xl"
                {...fadeInUp}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="flex flex-col gap-6 md:flex-row">
                  <div className="flex items-center justify-center flex-shrink-0 w-20 h-20 text-4xl rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900">
                    {job.company?.logoUrl ? (
                      <img src={job.company.logoUrl} alt={job.company.name} className="object-contain w-16 h-16" />
                    ) : (
                      '🏢'
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {job.isUrgent && (
                        <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Urgent
                        </span>
                      )}
                      {job.isFeatured && (
                        <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" /> Hot
                        </span>
                      )}
                    </div>
                    <h1 className="mb-2 text-2xl font-bold text-white md:text-3xl">{job.title}</h1>
                    <Link 
                      to={`/companies/${job.company?.id}`}
                      className="text-lg transition-colors text-violet-400 hover:text-violet-300"
                    >
                      {job.company?.name}
                    </Link>
                    
                    <div className="flex flex-wrap gap-4 mt-4 text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" />
                        {job.salaryMin && job.salaryMax 
                          ? `${(job.salaryMin/1000000).toFixed(0)}-${(job.salaryMax/1000000).toFixed(0)} triệu`
                          : 'Thỏa thuận'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" /> {job.jobType?.replace('_', ' ')}
                      </span>
                      {job.isRemote && (
                        <span className="flex items-center gap-1.5 text-green-400">
                          <Globe className="w-4 h-4" /> Remote
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Hide apply for employers */}
                <div className="flex flex-wrap gap-3 pt-6 mt-6 border-t border-gray-800">
                  {user?.role === 'EMPLOYER' ? (
                    <div className="flex items-center gap-2 px-6 py-3 text-gray-400 bg-gray-800/50 rounded-xl">
                      <Briefcase className="w-5 h-5" />
                      <span>Chức năng ứng tuyển chỉ dành cho ứng viên</span>
                    </div>
                  ) : !hasApplied ? (
                    <>
                      <button
                        onClick={() => setShowApplyModal(true)}
                        disabled={applyLoading || quickApplyLoading}
                        className="flex-1 px-6 py-3 btn-primary md:flex-none disabled:opacity-50"
                      >
                        <Send className="w-5 h-5 mr-2" /> Ứng tuyển ngay
                      </button>
                      <button
                        onClick={handleQuickApply}
                        disabled={quickApplyLoading || applyLoading}
                        className="flex items-center gap-2 px-6 py-3 font-medium text-white transition-all bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-xl disabled:opacity-50"
                      >
                        <Zap className="w-5 h-5" />
                        {quickApplyLoading ? 'Đang gửi...' : 'Ứng tuyển nhanh'}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 px-6 py-3 font-medium text-green-400 bg-green-500/20 rounded-xl">
                        <CheckCircle className="w-5 h-5" /> Đã ứng tuyển
                      </div>
                      <button
                        onClick={handleStartChat}
                        className="flex items-center gap-2 px-6 py-3 font-medium text-white transition-all bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Nhắn tin với nhà tuyển dụng
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleSaveJob}
                    className={`p-3 rounded-xl transition-all ${
                      isSaved ? 'bg-violet-500/20 text-violet-400' : 'glass-card text-gray-400 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                  <button onClick={handleShare} className="p-3 text-gray-400 glass-card rounded-xl hover:text-white">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>

              {/* Job Details */}
              <motion.div
                className="p-6 glass-card rounded-2xl"
                {...fadeInUp}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold text-white">
                  <BookOpen className="w-5 h-5 text-violet-400" /> Mô tả công việc
                </h2>
                <div className="leading-relaxed prose text-gray-300 prose-invert max-w-none">
                  {job.description?.split('\n').map((line, i) => (
                    <p key={i} className="mb-3">{line}</p>
                  ))}
                </div>
              </motion.div>

              {/* Requirements */}
              {job.requirements && (
                <motion.div
                  className="p-6 glass-card rounded-2xl"
                  {...fadeInUp}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold text-white">
                    <CheckCircle className="w-5 h-5 text-violet-400" /> Yêu cầu
                  </h2>
                  <div className="prose text-gray-300 prose-invert max-w-none">
                    {job.requirements.split('\n').map((line, i) => (
                      <p key={i} className="flex items-start gap-2 mb-2">
                        <span className="mt-1 text-violet-400">•</span> {line}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Responsibilities */}
              {job.responsibilities && (
                <motion.div
                  className="p-6 glass-card rounded-2xl"
                  {...fadeInUp}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold text-white">
                    <Award className="w-5 h-5 text-violet-400" /> Trách nhiệm
                  </h2>
                  <div className="prose text-gray-300 prose-invert max-w-none">
                    {job.responsibilities.split('\n').map((line, i) => (
                      <p key={i} className="flex items-start gap-2 mb-2">
                        <span className="mt-1 text-violet-400">•</span> {line}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <motion.div
                  className="p-6 glass-card rounded-2xl"
                  {...fadeInUp}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <h2 className="mb-4 text-xl font-semibold text-white">Kỹ năng yêu cầu</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, idx) => (
                      <span key={idx} className="skill-pill">{skill.name || skill}</span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <motion.div
              className="space-y-6"
              {...slideInRight}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Job Info Card */}
              <motion.div
                className="p-6 glass-card rounded-2xl"
                {...scaleIn}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <h3 className="mb-4 font-semibold text-white">Thông tin chung</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-400">
                      <Briefcase className="w-4 h-4" /> Loại công việc
                    </span>
                    <span className="text-white">{job.jobType?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-400">
                      <Award className="w-4 h-4" /> Kinh nghiệm
                    </span>
                    <span className="text-white">{job.experienceLevel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-400">
                      <Users className="w-4 h-4" /> Số lượng
                    </span>
                    <span className="text-white">{job.positionsCount || 1} người</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" /> Hạn nộp
                    </span>
                    <span className="text-white">
                      {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" /> Đăng ngày
                    </span>
                    <span className="text-white">
                      {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Company Card */}
              <motion.div
                className="p-6 glass-card rounded-2xl"
                {...scaleIn}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <h3 className="mb-4 font-semibold text-white">Về công ty</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center text-2xl w-14 h-14 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900">
                    {job.company?.logoUrl ? (
                      <img src={job.company.logoUrl} alt={job.company.name} className="object-contain w-10 h-10" />
                    ) : (
                      '🏢'
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{job.company?.name}</h4>
                    <p className="text-sm text-gray-400">{job.company?.industry}</p>
                  </div>
                </div>
                <p className="mb-4 text-sm text-gray-400 line-clamp-3">
                  {job.company?.description || 'Chưa có mô tả'}
                </p>
                <Link
                  to={`/companies/${job.company?.id}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 glass-card rounded-xl text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Xem công ty <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* Related Jobs */}
              {relatedJobs.length > 0 && (
                <motion.div
                  className="p-6 glass-card rounded-2xl"
                  {...scaleIn}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <h3 className="mb-4 font-semibold text-white">Việc làm liên quan</h3>
                  <div className="space-y-3">
                    {relatedJobs.map(rJob => (
                      <Link
                        key={rJob.id}
                        to={`/jobs/${rJob.id}`}
                        className="block p-3 transition-colors rounded-xl hover:bg-gray-800/50"
                      >
                        <h4 className="mb-1 text-sm font-medium text-white">{rJob.title}</h4>
                        <p className="text-xs text-gray-400">
                          {rJob.salaryMin && rJob.salaryMax 
                            ? `${(rJob.salaryMin/1000000).toFixed(0)}-${(rJob.salaryMax/1000000).toFixed(0)} triệu`
                            : 'Thỏa thuận'}
                        </p>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 glass-card rounded-2xl">
            <h2 className="mb-4 text-xl font-bold text-white">Ứng tuyển - {job.title}</h2>
            
            {!isAuthenticated ? (
              <div className="py-6 text-center">
                <p className="mb-4 text-gray-400">Vui lòng đăng nhập để ứng tuyển</p>
                <Link to="/login" className="btn-primary">Đăng nhập</Link>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block mb-2 text-sm text-gray-400">Thư giới thiệu (không bắt buộc)</label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Viết vài dòng giới thiệu về bản thân và lý do bạn phù hợp với vị trí này..."
                    className="w-full h-32 resize-none input-field"
                  />
                </div>

                <div className="flex items-start gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 mt-1 bg-gray-800 border-gray-600 rounded text-violet-500 focus:ring-violet-500"
                  />
                  <label htmlFor="anonymous" className="text-sm text-gray-400 cursor-pointer">
                    <span className="font-medium text-white">Ứng tuyển ẩn danh</span>
                    <p className="mt-1 text-xs">Thông tin cá nhân của bạn sẽ được ẩn khỏi nhà tuyển dụng cho đến khi bạn chấp nhận phỏng vấn</p>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="flex-1 py-3 text-gray-400 glass-card rounded-xl hover:text-white"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={applyLoading}
                    className="flex-1 py-3 btn-primary disabled:opacity-50"
                  >
                    {applyLoading ? 'Đang gửi...' : 'Gửi ứng tuyển'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default JobDetailPage;
