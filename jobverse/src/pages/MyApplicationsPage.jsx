// src/pages/MyApplicationsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Filter, Search, Clock, CheckCircle, XCircle, AlertCircle,
  Eye, Building2, MapPin, DollarSign, Calendar, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Navbar, Footer, LoadingSpinner, EmptyState } from '../components';
import AnimatedBackground from '../components/AnimatedBackground';

// Match backend ApplicationStatus enum exactly
const STATUS_CONFIG = {
  PENDING: {
    label: 'Chờ xử lý',
    icon: Clock,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  REVIEWING: {
    label: 'Đang xem xét',
    icon: Eye,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  SHORTLISTED: {
    label: 'Đã chọn',
    icon: CheckCircle,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
  },
  INTERVIEW: {
    label: 'Mời phỏng vấn',
    icon: AlertCircle,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  OFFERED: {
    label: 'Đã gửi offer',
    icon: CheckCircle,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
  },
  HIRED: {
    label: 'Đã tuyển',
    icon: CheckCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  REJECTED: {
    label: 'Từ chối',
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
  },
  WITHDRAWN: {
    label: 'Đã rút đơn',
    icon: XCircle,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
  },
};

const MyApplicationsPage = () => {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    searchQuery: '',
    status: '',
    sortBy: 'newest', // newest, oldest
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchApplications();
  }, [isAuthenticated]);

  useEffect(() => {
    applyFilters();
  }, [applications, filters]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await jobsAPI.getMyApplications();
      // Backend trả về ApiResponse với cấu trúc { success, message, data }
      // Nhưng handleResponse trong api.js đã parse, nên response chính là object đó
      const applications = response.data || [];
      
      // Map lại data để phù hợp với UI (vì backend trả về ApplicationResponse)
      const mappedApplications = applications.map(app => ({
        id: app.id,
        status: app.status,
        appliedAt: app.appliedAt,
        coverLetter: app.coverLetter,
        job: {
          id: app.jobId,
          title: app.jobTitle,
          location: app.location,
          salaryMin: app.salaryRange ? parseSalary(app.salaryRange, 'min') : null,
          salaryMax: app.salaryRange ? parseSalary(app.salaryRange, 'max') : null,
          company: {
            name: app.companyName,
            logoUrl: app.companyLogo
          }
        }
      }));
      
      setApplications(mappedApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Không thể tải danh sách đơn ứng tuyển');
    } finally {
      setLoading(false);
    }
  };

  // Helper function để parse salary từ string "X - Y triệu"
  const parseSalary = (salaryRange, type) => {
    if (!salaryRange) return null;
    const match = salaryRange.match(/(\d+)\s*-\s*(\d+)/);
    if (match) {
      return type === 'min' ? parseInt(match[1]) * 1000000 : parseInt(match[2]) * 1000000;
    }
    return null;
  };

  const applyFilters = () => {
    let filtered = [...applications];

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(app =>
        app.job?.title.toLowerCase().includes(query) ||
        app.job?.company?.name.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(app => app.status === filters.status);
    }

    // Sort
    if (filters.sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    } else {
      filtered.sort((a, b) => new Date(a.appliedAt) - new Date(b.appliedAt));
    }

    setFilteredApplications(filtered);
  };

  const getStatusStats = () => {
    const stats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'PENDING').length,
      reviewing: applications.filter(app => app.status === 'REVIEWING').length,
      shortlisted: applications.filter(app => app.status === 'SHORTLISTED').length,
      interview: applications.filter(app => app.status === 'INTERVIEW').length,
      offered: applications.filter(app => app.status === 'OFFERED').length,
      hired: applications.filter(app => app.status === 'HIRED').length,
      rejected: applications.filter(app => app.status === 'REJECTED').length,
      withdrawn: applications.filter(app => app.status === 'WITHDRAWN').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0b]' : 'bg-slate-50'} text-gray-100`}>
        <Navbar />
        <div className="pt-24"><LoadingSpinner size="lg" /></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0b]' : 'bg-slate-50'} text-gray-100 transition-colors duration-500`}>
      <AnimatedBackground />
      <Navbar />

      <main className="px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-8 h-8 text-violet-400" />
              <h1 className="text-3xl font-bold text-white">Đơn ứng tuyển của tôi</h1>
            </div>
            <p className="text-gray-400">
              Quản lý và theo dõi trạng thái đơn ứng tuyển
            </p>
          </div>

          {applications.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Chưa có đơn ứng tuyển nào"
              description="Hãy bắt đầu tìm kiếm và ứng tuyển vào các vị trí phù hợp với bạn."
              action={
                <button
                  onClick={() => navigate('/jobs')}
                  className="inline-flex items-center gap-2 btn-primary"
                >
                  <Search className="w-5 h-5" />
                  Tìm việc làm
                </button>
              }
            />
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-6">
                <div className="p-4 text-center glass-card rounded-xl">
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-xs text-gray-400">Tổng số</p>
                </div>
                <div className="p-4 text-center glass-card rounded-xl">
                  <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                  <p className="text-xs text-gray-400">Chờ xử lý</p>
                </div>
                <div className="p-4 text-center glass-card rounded-xl">
                  <p className="text-2xl font-bold text-blue-400">{stats.reviewing}</p>
                  <p className="text-xs text-gray-400">Xem xét</p>
                </div>
                <div className="p-4 text-center glass-card rounded-xl">
                  <p className="text-2xl font-bold text-purple-400">{stats.interviewing}</p>
                  <p className="text-xs text-gray-400">Phỏng vấn</p>
                </div>
                <div className="p-4 text-center glass-card rounded-xl">
                  <p className="text-2xl font-bold text-green-400">{stats.accepted}</p>
                  <p className="text-xs text-gray-400">Chấp nhận</p>
                </div>
                <div className="p-4 text-center glass-card rounded-xl">
                  <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
                  <p className="text-xs text-gray-400">Từ chối</p>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="p-4 mb-6 glass-card rounded-2xl">
                <div className="flex flex-col items-center gap-4 md:flex-row">
                  {/* Search Input */}
                  <div className="flex items-center flex-1 w-full gap-2 px-4 py-2 bg-gray-900/50 rounded-xl">
                    <Search className="w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm công việc, công ty..."
                      value={filters.searchQuery}
                      onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                      className="flex-1 text-white placeholder-gray-500 bg-transparent focus:outline-none"
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-4 py-2 text-white bg-gray-900/50 rounded-xl focus:outline-none"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="REVIEWING">Đang xem xét</option>
                    <option value="SHORTLISTED">Đã chọn</option>
                    <option value="INTERVIEW">Mời phỏng vấn</option>
                    <option value="OFFERED">Đã gửi offer</option>
                    <option value="HIRED">Đã tuyển</option>
                    <option value="REJECTED">Từ chối</option>
                    <option value="WITHDRAWN">Đã rút đơn</option>
                  </select>

                  {/* Sort */}
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="px-4 py-2 text-white bg-gray-900/50 rounded-xl focus:outline-none"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mb-4">
                <p className="text-gray-400">
                  Hiển thị <span className="font-semibold text-white">{filteredApplications.length}</span> / {applications.length} đơn ứng tuyển
                </p>
              </div>

              {/* Applications List */}
              {filteredApplications.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="Không tìm thấy đơn ứng tuyển"
                  description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                />
              ) : (
                <div className="space-y-4">
                  {filteredApplications.map((application) => {
                    const statusConfig = STATUS_CONFIG[application.status] || STATUS_CONFIG.PENDING;
                    const StatusIcon = statusConfig.icon;

                    return (
                      <div
                        key={application.id}
                        className="p-5 cursor-pointer glass-card rounded-2xl hover:bg-gray-800/40 group"
                        onClick={() => navigate(`/jobs/${application.job?.id}`)}
                      >
                        <div className="flex flex-col gap-4 md:flex-row">
                          {/* Company Logo */}
                          <div className="flex items-center justify-center flex-shrink-0 w-16 h-16 text-3xl rounded-xl bg-gradient-to-br from-gray-800 to-gray-900">
                            {application.job?.company?.logoUrl ? (
                              <img
                                src={application.job.company.logoUrl}
                                alt={application.job.company.name}
                                className="object-contain w-12 h-12"
                              />
                            ) : (
                              '🏢'
                            )}
                          </div>

                          {/* Application Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="mb-1 text-lg font-semibold text-white transition-colors group-hover:text-violet-400">
                                  {application.job?.title}
                                </h3>
                                <p className="flex items-center gap-2 text-sm text-gray-400">
                                  <Building2 className="w-4 h-4" />
                                  {application.job?.company?.name}
                                </p>
                              </div>

                              {/* Status Badge */}
                              <span className={`flex items-center gap-1.5 px-3 py-1.5 ${statusConfig.bgColor} ${statusConfig.color} rounded-full text-sm font-medium flex-shrink-0`}>
                                <StatusIcon className="w-4 h-4" />
                                {statusConfig.label}
                              </span>
                            </div>

                            {/* Job Details */}
                            <div className="flex flex-wrap mb-3 text-sm text-gray-500 gap-x-4 gap-y-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {application.job?.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5" />
                                {application.job?.salaryMin && application.job?.salaryMax
                                  ? `${(application.job.salaryMin / 1000000).toFixed(0)}-${(application.job.salaryMax / 1000000).toFixed(0)} triệu`
                                  : 'Thỏa thuận'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                Ứng tuyển: {new Date(application.appliedAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>

                            {/* Cover Letter Preview */}
                            {application.coverLetter && (
                              <div className="p-3 mb-3 rounded-lg glass-card">
                                <p className="mb-1 text-sm font-medium text-gray-400">Thư xin việc:</p>
                                <p className="text-sm text-gray-300 line-clamp-2">
                                  {application.coverLetter}
                                </p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-800/50">
                              <span className="text-xs text-gray-500">
                                ID: #{application.id}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/jobs/${application.job?.id}`);
                                }}
                                className="btn-secondary py-1.5 text-sm flex items-center gap-2"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Xem công việc
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyApplicationsPage;
