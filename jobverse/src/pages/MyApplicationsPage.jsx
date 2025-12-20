// src/pages/MyApplicationsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Filter, Search, Clock, CheckCircle, XCircle, AlertCircle,
  Eye, Building2, MapPin, DollarSign, Calendar, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navbar, Footer, LoadingSpinner, EmptyState } from '../components';

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
  INTERVIEWING: {
    label: 'Phỏng vấn',
    icon: AlertCircle,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  ACCEPTED: {
    label: 'Chấp nhận',
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
};

const MyApplicationsPage = () => {
  const { isAuthenticated } = useAuth();
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
      setApplications(response.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Không thể tải danh sách đơn ứng tuyển');
    } finally {
      setLoading(false);
    }
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
      interviewing: applications.filter(app => app.status === 'INTERVIEWING').length,
      accepted: applications.filter(app => app.status === 'ACCEPTED').length,
      rejected: applications.filter(app => app.status === 'REJECTED').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-gray-100">
        <Navbar />
        <div className="pt-24"><LoadingSpinner size="lg" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-100">
      <Navbar />

      <main className="pt-24 pb-16 px-4">
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
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Tìm việc làm
                </button>
              }
            />
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
                <div className="glass-card rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-xs text-gray-400">Tổng số</p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                  <p className="text-xs text-gray-400">Chờ xử lý</p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-400">{stats.reviewing}</p>
                  <p className="text-xs text-gray-400">Xem xét</p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-purple-400">{stats.interviewing}</p>
                  <p className="text-xs text-gray-400">Phỏng vấn</p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">{stats.accepted}</p>
                  <p className="text-xs text-gray-400">Chấp nhận</p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
                  <p className="text-xs text-gray-400">Từ chối</p>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="glass-card rounded-2xl p-4 mb-6">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  {/* Search Input */}
                  <div className="flex-1 w-full flex items-center gap-2 px-4 py-2 bg-gray-900/50 rounded-xl">
                    <Search className="w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm công việc, công ty..."
                      value={filters.searchQuery}
                      onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                      className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-4 py-2 bg-gray-900/50 rounded-xl text-white focus:outline-none"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="REVIEWING">Đang xem xét</option>
                    <option value="INTERVIEWING">Phỏng vấn</option>
                    <option value="ACCEPTED">Chấp nhận</option>
                    <option value="REJECTED">Từ chối</option>
                  </select>

                  {/* Sort */}
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="px-4 py-2 bg-gray-900/50 rounded-xl text-white focus:outline-none"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mb-4">
                <p className="text-gray-400">
                  Hiển thị <span className="text-white font-semibold">{filteredApplications.length}</span> / {applications.length} đơn ứng tuyển
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
                        className="glass-card rounded-2xl p-5 hover:bg-gray-800/40 cursor-pointer group"
                        onClick={() => navigate(`/jobs/${application.job?.id}`)}
                      >
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Company Logo */}
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-3xl flex-shrink-0">
                            {application.job?.company?.logoUrl ? (
                              <img
                                src={application.job.company.logoUrl}
                                alt={application.job.company.name}
                                className="w-12 h-12 object-contain"
                              />
                            ) : (
                              '🏢'
                            )}
                          </div>

                          {/* Application Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-lg font-semibold text-white group-hover:text-violet-400 transition-colors mb-1">
                                  {application.job?.title}
                                </h3>
                                <p className="text-gray-400 text-sm flex items-center gap-2">
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
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
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
                              <div className="glass-card p-3 rounded-lg mb-3">
                                <p className="text-sm text-gray-400 mb-1 font-medium">Thư xin việc:</p>
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
