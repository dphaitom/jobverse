// src/pages/JobApplicantsPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar, Footer, LoadingSpinner, EmptyState } from '../components';
import { jobsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Match backend ApplicationStatus enum exactly
const STATUS_CONFIG = {
  PENDING: { label: 'Chờ xử lý', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', icon: Clock },
  REVIEWING: { label: 'Đang xem xét', color: 'text-blue-400', bgColor: 'bg-blue-500/20', icon: Eye },
  SHORTLISTED: { label: 'Đã chọn', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', icon: CheckCircle },
  INTERVIEW: { label: 'Mời phỏng vấn', color: 'text-purple-400', bgColor: 'bg-purple-500/20', icon: Users },
  OFFERED: { label: 'Đã gửi offer', color: 'text-orange-400', bgColor: 'bg-orange-500/20', icon: CheckCircle },
  HIRED: { label: 'Đã tuyển', color: 'text-green-400', bgColor: 'bg-green-500/20', icon: CheckCircle },
  REJECTED: { label: 'Từ chối', color: 'text-red-400', bgColor: 'bg-red-500/20', icon: XCircle },
  WITHDRAWN: { label: 'Ứng viên rút đơn', color: 'text-gray-400', bgColor: 'bg-gray-500/20', icon: XCircle },
};

const JobApplicantsPage = () => {
  const { jobId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'EMPLOYER' && user?.role !== 'ADMIN') {
      toast.error('Chỉ nhà tuyển dụng mới có thể xem ứng viên');
      navigate('/');
      return;
    }

    fetchData();
  }, [isAuthenticated, user, jobId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobRes, applicantsRes] = await Promise.all([
        jobsAPI.getJobById(jobId),
        jobsAPI.getJobApplications(jobId),
      ]);

      setJob(jobRes.data);
      const applicantsData = applicantsRes.data || [];
      setApplicants(Array.isArray(applicantsData) ? applicantsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải danh sách ứng viên');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await jobsAPI.updateApplicationStatus(applicationId, newStatus);
      toast.success('Cập nhật trạng thái thành công');
      fetchData();
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const filteredApplicants = filterStatus === 'ALL' 
    ? applicants 
    : applicants.filter(a => a.status === filterStatus);

  const stats = {
    total: applicants.length,
    pending: applicants.filter(a => a.status === 'PENDING').length,
    reviewing: applicants.filter(a => a.status === 'REVIEWING').length,
    shortlisted: applicants.filter(a => a.status === 'SHORTLISTED').length,
    interview: applicants.filter(a => a.status === 'INTERVIEW').length,
    offered: applicants.filter(a => a.status === 'OFFERED').length,
    hired: applicants.filter(a => a.status === 'HIRED').length,
    rejected: applicants.filter(a => a.status === 'REJECTED').length,
    withdrawn: applicants.filter(a => a.status === 'WITHDRAWN').length,
  };

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

      <main className="px-4 pt-24 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-start gap-4 mb-8">
            <button
              onClick={() => navigate('/employer/dashboard')}
              className="p-2 rounded-xl hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">Ứng viên: {job?.title}</h1>
              <p className="text-gray-400">Quản lý và đánh giá ứng viên cho vị trí này</p>
            </div>
            <Link
              to={`/jobs/${jobId}`}
              className="btn-primary flex items-center gap-2"
            >
              <Eye className="w-5 h-5" />
              Xem tin tuyển dụng
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <div className="glass-card p-4 rounded-2xl">
              <div className="text-gray-400 text-sm mb-1">Tổng số</div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>
            <div className="glass-card p-4 rounded-2xl">
              <div className="text-gray-400 text-sm mb-1">Chờ xử lý</div>
              <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            </div>
            <div className="glass-card p-4 rounded-2xl">
              <div className="text-gray-400 text-sm mb-1">Đang xem</div>
              <div className="text-2xl font-bold text-blue-400">{stats.reviewing}</div>
            </div>
            <div className="glass-card p-4 rounded-2xl">
              <div className="text-gray-400 text-sm mb-1">Phỏng vấn</div>
              <div className="text-2xl font-bold text-purple-400">{stats.interview}</div>
            </div>
            <div className="glass-card p-4 rounded-2xl">
              <div className="text-gray-400 text-sm mb-1">Đã tuyển</div>
              <div className="text-2xl font-bold text-green-400">{stats.hired}</div>
            </div>
            <div className="glass-card p-4 rounded-2xl">
              <div className="text-gray-400 text-sm mb-1">Từ chối</div>
              <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="glass-card rounded-2xl p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  filterStatus === 'ALL' 
                    ? 'bg-violet-500 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Tất cả ({stats.total})
              </button>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl transition-colors ${
                    filterStatus === status 
                      ? `${config.bgColor} ${config.color}` 
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {config.label} ({stats[status.toLowerCase()]})
                </button>
              ))}
            </div>
          </div>

          {/* Applicants List */}
          {filteredApplicants.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Chưa có ứng viên nào"
              description={filterStatus === 'ALL' 
                ? 'Chưa có ai ứng tuyển cho vị trí này' 
                : `Không có ứng viên với trạng thái "${STATUS_CONFIG[filterStatus]?.label}"`}
            />
          ) : (
            <div className="space-y-4">
              {filteredApplicants.map((applicant) => {
                const statusConfig = STATUS_CONFIG[applicant.status] || STATUS_CONFIG.PENDING;
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={applicant.id}
                    className="glass-card rounded-2xl p-6 hover:bg-gray-800/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                            {applicant.userName?.charAt(0) || applicant.userEmail?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {applicant.userName || 'Ứng viên'}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5" />
                                {applicant.userEmail}
                              </span>
                              {applicant.userPhone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3.5 h-3.5" />
                                  {applicant.userPhone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {applicant.coverLetter && (
                          <div className="mb-3 p-3 bg-gray-800/50 rounded-xl">
                            <p className="text-sm text-gray-300">{applicant.coverLetter}</p>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Nộp: {new Date(applicant.appliedAt).toLocaleDateString('vi-VN')}
                          </span>
                          {applicant.expectedSalary && (
                            <span>
                              Mong muốn: {(applicant.expectedSalary/1000000).toFixed(0)} triệu
                            </span>
                          )}
                          {applicant.isQuickApply && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                              Quick Apply
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <span className={`px-3 py-1.5 rounded-xl text-sm flex items-center gap-1.5 ${statusConfig.bgColor} ${statusConfig.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig.label}
                        </span>

                        <select
                          value={applicant.status}
                          onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
                          className="px-3 py-2 bg-gray-800 text-white rounded-xl border border-gray-700 text-sm"
                        >
                          {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                            <option key={status} value={status}>
                              Chuyển sang: {config.label}
                            </option>
                          ))}
                        </select>

                        {applicant.resumeId && (
                          <button
                            className="px-3 py-2 bg-violet-500/20 text-violet-400 rounded-xl hover:bg-violet-500/30 transition-colors text-sm flex items-center gap-1.5"
                            title="Xem CV"
                          >
                            <FileText className="w-4 h-4" />
                            Xem CV
                          </button>
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

export default JobApplicantsPage;
