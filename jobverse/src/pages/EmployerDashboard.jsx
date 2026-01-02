// src/pages/EmployerDashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Footer, LoadingSpinner, EmptyState } from '../components';
import AnimatedBackground from '../components/AnimatedBackground';
import { jobsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Plus,
  Briefcase,
  MapPin,
  DollarSign,
  Eye,
  Edit2,
  Trash2,
  Users,
  Calendar,
  ChevronRight,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  DRAFT: { label: 'Nháp', color: 'text-gray-400', bgColor: 'bg-gray-500/20', icon: Clock },
  ACTIVE: { label: 'Đang tuyển', color: 'text-green-400', bgColor: 'bg-green-500/20', icon: CheckCircle },
  CLOSED: { label: 'Đã đóng', color: 'text-red-400', bgColor: 'bg-red-500/20', icon: XCircle },
};

const EmployerDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check if user is employer
    if (user?.role !== 'EMPLOYER' && user?.role !== 'ADMIN') {
      toast.error('Chỉ nhà tuyển dụng mới có thể truy cập trang này');
      navigate('/');
      return;
    }

    fetchJobs();
  }, [isAuthenticated, user]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getMyJobs();
      const jobsData = response.data?.content || response.data || [];
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Không thể tải danh sách việc làm');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (jobId, newStatus) => {
    try {
      await jobsAPI.changeJobStatus(jobId, newStatus);
      toast.success('Cập nhật trạng thái thành công');
      fetchJobs();
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
    }
    setShowMenu(null);
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin tuyển dụng này?')) return;

    try {
      await jobsAPI.deleteJob(jobId);
      toast.success('Đã xóa tin tuyển dụng');
      fetchJobs();
    } catch (error) {
      toast.error('Không thể xóa tin tuyển dụng');
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

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.status === 'ACTIVE').length,
    draft: jobs.filter(j => j.status === 'DRAFT').length,
    closed: jobs.filter(j => j.status === 'CLOSED').length,
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0b]' : 'bg-slate-50'} text-gray-100 transition-colors duration-500`}>
      <AnimatedBackground />
      <Navbar />

      <main className="px-4 pt-24 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Quản lý tin tuyển dụng</h1>
              <p className="text-gray-400">Quản lý và theo dõi các tin đăng tuyển của bạn</p>
            </div>
            <Link to="/employer/jobs/new" className="btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Đăng tin tuyển dụng
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Tổng số</span>
                <Briefcase className="w-5 h-5 text-violet-400" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Đang tuyển</span>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.active}</p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Nháp</span>
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.draft}</p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Đã đóng</span>
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.closed}</p>
            </div>
          </div>

          {/* Jobs List */}
          {jobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="Chưa có tin tuyển dụng nào"
              description="Bắt đầu đăng tin tuyển dụng đầu tiên của bạn"
              action={
                <Link to="/employer/jobs/new" className="btn-primary">
                  <Plus className="w-5 h-5 mr-2" />
                  Đăng tin tuyển dụng
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const statusConfig = STATUS_CONFIG[job.status] || STATUS_CONFIG.DRAFT;
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={job.id}
                    className="glass-card rounded-2xl p-6 hover:bg-gray-800/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="text-xl font-semibold text-white hover:text-violet-400 transition-colors"
                          >
                            {job.title}
                          </Link>
                          <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1.5 ${statusConfig.bgColor} ${statusConfig.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          {job.salaryMin && job.salaryMax && (
                            <span className="flex items-center gap-1.5">
                              <DollarSign className="w-4 h-4" />
                              {(job.salaryMin/1000000).toFixed(0)}-{(job.salaryMax/1000000).toFixed(0)} triệu
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                          <span className="flex items-center gap-1.5 text-gray-500">
                            <Eye className="w-4 h-4" />
                            {job.viewCount || 0} lượt xem
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-500">
                            <Users className="w-4 h-4" />
                            {job.applicationCount || 0} ứng viên
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 relative">
                        <Link
                          to={`/employer/jobs/${job.id}/applicants`}
                          className="p-2 rounded-xl hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                          title="Xem ứng viên"
                        >
                          <Users className="w-5 h-5" />
                        </Link>
                        <Link
                          to={`/employer/jobs/${job.id}/edit`}
                          className="p-2 rounded-xl hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => setShowMenu(showMenu === job.id ? null : job.id)}
                          className="p-2 rounded-xl hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Dropdown Menu */}
                        {showMenu === job.id && (
                          <div className="absolute right-0 top-12 w-48 glass-card rounded-xl border border-gray-700 shadow-xl z-10">
                            {job.status !== 'ACTIVE' && (
                              <button
                                onClick={() => handleChangeStatus(job.id, 'ACTIVE')}
                                className="w-full px-4 py-2.5 text-left text-green-400 hover:bg-gray-700/50 rounded-t-xl"
                              >
                                Kích hoạt
                              </button>
                            )}
                            {job.status !== 'CLOSED' && (
                              <button
                                onClick={() => handleChangeStatus(job.id, 'CLOSED')}
                                className="w-full px-4 py-2.5 text-left text-gray-300 hover:bg-gray-700/50"
                              >
                                Đóng tin
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="w-full px-4 py-2.5 text-left text-red-400 hover:bg-red-500/10 rounded-b-xl"
                            >
                              Xóa tin
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EmployerDashboard;
