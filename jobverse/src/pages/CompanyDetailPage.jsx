// src/pages/CompanyDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Globe, Users, Star, Building2, Calendar, Briefcase,
  ArrowLeft, ExternalLink, ChevronRight
} from 'lucide-react';
import { companiesAPI, jobsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Navbar, Footer, JobCard, LoadingSpinner, EmptyState } from '../components';
import toast from 'react-hot-toast';

const CompanyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [appliedJobs, setAppliedJobs] = useState(new Set());

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
      const [companyRes, jobsRes] = await Promise.all([
        companiesAPI.getCompanyById(id),
        jobsAPI.getJobsByCompany(id),
      ]);
      
      setCompany(companyRes.data);
      
      // Handle different response formats
      const jobsData = jobsRes.data?.content || jobsRes.data || [];
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-[#0a0a0b] text-gray-100">
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
                {tab === 'reviews' && 'Đánh giá'}
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
                <div className="glass-card rounded-2xl p-6">
                  <EmptyState
                    icon={Star}
                    title="Chưa có đánh giá"
                    description="Hãy là người đầu tiên đánh giá công ty này."
                    action={
                      <button className="btn-primary">Viết đánh giá</button>
                    }
                  />
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
