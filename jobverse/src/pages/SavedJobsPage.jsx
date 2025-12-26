// src/pages/SavedJobsPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Navbar, Footer, LoadingSpinner, EmptyState } from '../components';
import {
  Bookmark,
  MapPin,
  DollarSign,
  Briefcase,
  Building2,
  Trash2,
  User,
  FileText,
  Settings,
  Clock,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const SavedJobsPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchSavedJobs();
  }, [isAuthenticated]);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await jobsAPI.getSavedJobs();
      console.log('Saved jobs response:', response);

      const jobs = response.data?.content || response.data || response.content || [];
      setSavedJobs(Array.isArray(jobs) ? jobs : []);
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
      setError(err.message || 'Không thể tải danh sách việc làm đã lưu');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveJob = async (jobId) => {
    try {
      await jobsAPI.unsaveJob(jobId);
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      toast.success('Đã bỏ lưu việc làm');
    } catch (err) {
      console.error('Error unsaving job:', err);
      toast.error('Không thể bỏ lưu việc làm');
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

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-100">
      <Navbar />
      
      <main className="px-4 pt-24 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <aside className="md:w-64 flex-shrink-0">
              <div className="glass-card rounded-2xl p-4 sticky top-20">
                <nav className="space-y-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-colors"
                  >
                    <User className="w-5 h-5" />
                    Hồ sơ của tôi
                  </Link>
                  <Link
                    to="/saved-jobs"
                    className="flex items-center gap-3 px-4 py-2.5 text-white bg-violet-500/20 rounded-xl"
                  >
                    <Bookmark className="w-5 h-5" />
                    Việc đã lưu
                  </Link>
                  <Link
                    to="/my-applications"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-colors"
                  >
                    <FileText className="w-5 h-5" />
                    Đã ứng tuyển
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    Cài đặt
                  </Link>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">Việc làm đã lưu</h1>
                <p className="text-gray-400">{savedJobs.length} việc làm đã lưu</p>
              </div>

              {savedJobs.length === 0 ? (
                <EmptyState
                  icon={Bookmark}
                  title="Chưa có việc làm nào được lưu"
                  description="Hãy lưu các việc làm bạn quan tâm để xem lại sau"
                  action={
                    <Link to="/jobs" className="btn-primary">
                      <Briefcase className="w-5 h-5 mr-2" />
                      Tìm việc làm
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {savedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-6 glass-card rounded-2xl hover:bg-gray-800/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="text-xl font-semibold text-white hover:text-violet-400 transition-colors inline-block mb-2"
                          >
                            {job.title}
                          </Link>

                          <div className="flex items-center gap-2 mb-3 text-gray-400">
                            <Building2 className="w-4 h-4" />
                            <span>{job.companyName || job.company?.name || 'Công ty'}</span>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            {job.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{job.location}</span>
                              </div>
                            )}

                            {(job.salaryMin || job.salaryMax) && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span>
                                  {job.salaryMin && job.salaryMax
                                    ? `${(job.salaryMin/1000000).toFixed(0)}-${(job.salaryMax/1000000).toFixed(0)} triệu`
                                    : 'Thỏa thuận'}
                                </span>
                              </div>
                            )}

                            {job.jobType && (
                              <div className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                <span>{job.jobType.replace('_', ' ')}</span>
                              </div>
                            )}

                            {job.createdAt && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleUnsaveJob(job.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                          title="Bỏ lưu"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SavedJobsPage;
