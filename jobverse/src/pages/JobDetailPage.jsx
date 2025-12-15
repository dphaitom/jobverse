// src/pages/JobDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, DollarSign, Briefcase, Clock, Globe, Users, Building2,
  Heart, Share2, ArrowLeft, CheckCircle, Star, Zap, Calendar,
  Send, BookOpen, Award, ChevronRight
} from 'lucide-react';
import { jobsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navbar, Footer, LoadingSpinner, JobCard } from '../components';

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
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    fetchJobDetail();
  }, [id]);

  const fetchJobDetail = async () => {
    setLoading(true);
    try {
      const response = await jobsAPI.getJobById(id);
      setJob(response.data);
      
      // Fetch related jobs
      if (response.data?.company?.id) {
        const relatedRes = await jobsAPI.getJobsByCompany(response.data.company.id);
        setRelatedJobs((relatedRes.data || []).filter(j => j.id !== parseInt(id)).slice(0, 3));
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
      } else {
        await jobsAPI.saveJob(id);
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setApplyLoading(true);
    try {
      await jobsAPI.applyJob(id, { coverLetter });
      setShowApplyModal(false);
      alert('Ứng tuyển thành công!');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setApplyLoading(false);
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
      alert('Đã copy link!');
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
          <Link to="/jobs" className="btn-primary mt-4 inline-block">Quay lại danh sách</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-100">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Quay lại
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-4xl flex-shrink-0">
                    {job.company?.logoUrl ? (
                      <img src={job.company.logoUrl} alt={job.company.name} className="w-16 h-16 object-contain" />
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
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{job.title}</h1>
                    <Link 
                      to={`/companies/${job.company?.id}`}
                      className="text-lg text-violet-400 hover:text-violet-300 transition-colors"
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

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-800">
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="btn-primary flex-1 md:flex-none py-3 px-8"
                  >
                    <Send className="w-5 h-5 mr-2" /> Ứng tuyển ngay
                  </button>
                  <button
                    onClick={handleSaveJob}
                    className={`p-3 rounded-xl transition-all ${
                      isSaved ? 'bg-violet-500/20 text-violet-400' : 'glass-card text-gray-400 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                  <button onClick={handleShare} className="p-3 glass-card rounded-xl text-gray-400 hover:text-white">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Job Details */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-violet-400" /> Mô tả công việc
                </h2>
                <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                  {job.description?.split('\n').map((line, i) => (
                    <p key={i} className="mb-3">{line}</p>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              {job.requirements && (
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-violet-400" /> Yêu cầu
                  </h2>
                  <div className="prose prose-invert max-w-none text-gray-300">
                    {job.requirements.split('\n').map((line, i) => (
                      <p key={i} className="mb-2 flex items-start gap-2">
                        <span className="text-violet-400 mt-1">•</span> {line}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Responsibilities */}
              {job.responsibilities && (
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-violet-400" /> Trách nhiệm
                  </h2>
                  <div className="prose prose-invert max-w-none text-gray-300">
                    {job.responsibilities.split('\n').map((line, i) => (
                      <p key={i} className="mb-2 flex items-start gap-2">
                        <span className="text-violet-400 mt-1">•</span> {line}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Kỹ năng yêu cầu</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, idx) => (
                      <span key={idx} className="skill-pill">{skill.name || skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Job Info Card */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-semibold text-white mb-4">Thông tin chung</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Loại công việc
                    </span>
                    <span className="text-white">{job.jobType?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Award className="w-4 h-4" /> Kinh nghiệm
                    </span>
                    <span className="text-white">{job.experienceLevel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Số lượng
                    </span>
                    <span className="text-white">{job.positionsCount || 1} người</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Hạn nộp
                    </span>
                    <span className="text-white">
                      {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Đăng ngày
                    </span>
                    <span className="text-white">
                      {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Company Card */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-semibold text-white mb-4">Về công ty</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-2xl">
                    {job.company?.logoUrl ? (
                      <img src={job.company.logoUrl} alt={job.company.name} className="w-10 h-10 object-contain" />
                    ) : (
                      '🏢'
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{job.company?.name}</h4>
                    <p className="text-sm text-gray-400">{job.company?.industry}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                  {job.company?.description || 'Chưa có mô tả'}
                </p>
                <Link
                  to={`/companies/${job.company?.id}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 glass-card rounded-xl text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Xem công ty <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Related Jobs */}
              {relatedJobs.length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="font-semibold text-white mb-4">Việc làm liên quan</h3>
                  <div className="space-y-3">
                    {relatedJobs.map(rJob => (
                      <Link
                        key={rJob.id}
                        to={`/jobs/${rJob.id}`}
                        className="block p-3 rounded-xl hover:bg-gray-800/50 transition-colors"
                      >
                        <h4 className="font-medium text-white text-sm mb-1">{rJob.title}</h4>
                        <p className="text-xs text-gray-400">
                          {rJob.salaryMin && rJob.salaryMax 
                            ? `${(rJob.salaryMin/1000000).toFixed(0)}-${(rJob.salaryMax/1000000).toFixed(0)} triệu`
                            : 'Thỏa thuận'}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card rounded-2xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Ứng tuyển - {job.title}</h2>
            
            {!isAuthenticated ? (
              <div className="text-center py-6">
                <p className="text-gray-400 mb-4">Vui lòng đăng nhập để ứng tuyển</p>
                <Link to="/login" className="btn-primary">Đăng nhập</Link>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Thư giới thiệu (không bắt buộc)</label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Viết vài dòng giới thiệu về bản thân và lý do bạn phù hợp với vị trí này..."
                    className="input-field w-full h-32 resize-none"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="flex-1 py-3 glass-card rounded-xl text-gray-400 hover:text-white"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={applyLoading}
                    className="flex-1 btn-primary py-3 disabled:opacity-50"
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
