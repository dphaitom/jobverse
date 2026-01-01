// src/pages/AICVRankingPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Users, FileText, ChevronRight, Briefcase, 
  ArrowUpDown, Filter, Search
} from 'lucide-react';
import { Navbar, Footer, LoadingSpinner, EmptyState } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { jobsAPI } from '../services/api';
import toast from 'react-hot-toast';

const AICVRankingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rankingLoading, setRankingLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'EMPLOYER') {
      toast.error('Chỉ nhà tuyển dụng mới có quyền truy cập');
      navigate('/');
      return;
    }
    
    fetchJobs();
  }, [isAuthenticated, user]);

  const fetchJobs = async () => {
    try {
      const response = await jobsAPI.getMyJobs();
      const jobsData = response.data?.content || response.data || [];
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (jobId) => {
    setRankingLoading(true);
    try {
      const response = await jobsAPI.getJobApplications(jobId);
      const apps = response.data || [];
      setApplications(Array.isArray(apps) ? apps : []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Không thể tải danh sách ứng viên');
    } finally {
      setRankingLoading(false);
    }
  };

  const handleSelectJob = (job) => {
    setSelectedJob(job);
    fetchApplications(job.id);
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
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">AI CV Ranking</h1>
                <p className="text-gray-400">Xếp hạng ứng viên phù hợp nhất cho vị trí tuyển dụng</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Job Selection */}
            <div className="lg:col-span-1">
              <div className="glass-card rounded-2xl p-5">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-violet-400" />
                  Chọn vị trí tuyển dụng
                </h2>
                
                {jobs.length > 0 ? (
                  <div className="space-y-2">
                    {jobs.map(job => (
                      <button
                        key={job.id}
                        onClick={() => handleSelectJob(job)}
                        className={`w-full text-left p-3 rounded-xl transition-colors ${
                          selectedJob?.id === job.id
                            ? 'bg-violet-500/20 border border-violet-500/50'
                            : 'bg-gray-800/30 hover:bg-gray-800/50 border border-transparent'
                        }`}
                      >
                        <h3 className="font-medium text-white truncate">{job.title}</h3>
                        <p className="text-sm text-gray-400 truncate">{job.location}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Users className="w-3 h-3" />
                          <span>{job.applicationsCount || 0} ứng viên</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Briefcase}
                    title="Chưa có tin tuyển dụng"
                    description="Đăng tin để bắt đầu nhận ứng viên"
                  />
                )}
              </div>
            </div>

            {/* Applications Ranking */}
            <div className="lg:col-span-2">
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <ArrowUpDown className="w-5 h-5 text-violet-400" />
                    Xếp hạng ứng viên
                  </h2>
                  
                  {selectedJob && (
                    <span className="px-3 py-1 text-sm bg-violet-500/20 text-violet-300 rounded-full">
                      {applications.length} ứng viên
                    </span>
                  )}
                </div>

                {!selectedJob ? (
                  <div className="py-12 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-400">Chọn một vị trí tuyển dụng để xem ứng viên</p>
                  </div>
                ) : rankingLoading ? (
                  <LoadingSpinner size="lg" />
                ) : applications.length > 0 ? (
                  <div className="space-y-3">
                    {applications.map((app, index) => (
                      <div
                        key={app.id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-300 text-black' :
                          index === 2 ? 'bg-orange-400 text-black' :
                          'bg-gray-700 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate">
                            {app.userFullName || app.candidateName || 'Ứng viên'}
                          </h3>
                          <p className="text-sm text-gray-400 truncate">
                            {app.userEmail || app.candidateEmail}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-medium text-violet-400">
                            {app.matchScore ? `${app.matchScore}% phù hợp` : 'Đang phân tích'}
                          </div>
                          <div className={`text-xs ${
                            app.status === 'PENDING' ? 'text-yellow-400' :
                            app.status === 'REVIEWING' ? 'text-blue-400' :
                            app.status === 'SHORTLISTED' ? 'text-cyan-400' :
                            app.status === 'INTERVIEW' ? 'text-purple-400' :
                            app.status === 'OFFERED' ? 'text-orange-400' :
                            app.status === 'HIRED' ? 'text-green-400' :
                            app.status === 'REJECTED' ? 'text-red-400' :
                            'text-gray-400'
                          }`}>
                            {app.status === 'PENDING' ? 'Chờ xem xét' :
                             app.status === 'REVIEWING' ? 'Đang xem xét' :
                             app.status === 'SHORTLISTED' ? 'Đã chọn' :
                             app.status === 'INTERVIEW' ? 'Mời phỏng vấn' :
                             app.status === 'OFFERED' ? 'Đã gửi offer' :
                             app.status === 'HIRED' ? 'Đã tuyển' :
                             app.status === 'REJECTED' ? 'Từ chối' :
                             app.status === 'WITHDRAWN' ? 'Đã rút đơn' :
                             app.status}
                          </div>
                        </div>

                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Users}
                    title="Chưa có ứng viên"
                    description="Vị trí này chưa có ai ứng tuyển"
                  />
                )}

                {/* AI Analysis Note */}
                {selectedJob && applications.length > 0 && (
                  <div className="mt-6 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-violet-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-violet-300">Phân tích AI</h4>
                        <p className="text-sm text-gray-400 mt-1">
                          Hệ thống AI đang phân tích CV và kinh nghiệm của ứng viên để đưa ra xếp hạng phù hợp nhất với yêu cầu công việc.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AICVRankingPage;
