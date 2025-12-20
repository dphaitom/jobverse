// src/pages/SavedJobsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark, Filter, Search, MapPin, DollarSign, X, Trash2, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navbar, Footer, LoadingSpinner, EmptyState, JobCard } from '../components';

const SavedJobsPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    searchQuery: '',
    location: '',
    salaryMin: '',
    jobType: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchSavedJobs();
  }, [isAuthenticated]);

  useEffect(() => {
    applyFilters();
  }, [savedJobs, filters]);

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const response = await jobsAPI.getSavedJobs();
      setSavedJobs(response.data || []);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      toast.error('Không thể tải danh sách việc đã lưu');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...savedJobs];

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.company?.name.toLowerCase().includes(query)
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Salary filter
    if (filters.salaryMin) {
      const minSalary = parseInt(filters.salaryMin) * 1000000;
      filtered = filtered.filter(job =>
        job.salaryMin >= minSalary || job.salaryMax >= minSalary
      );
    }

    // Job type filter
    if (filters.jobType) {
      filtered = filtered.filter(job => job.jobType === filters.jobType);
    }

    setFilteredJobs(filtered);
  };

  const handleUnsaveJob = async (jobId) => {
    try {
      await jobsAPI.unsaveJob(jobId);
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      toast.success('Đã xóa khỏi danh sách lưu');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa việc làm');
    }
  };

  const handleClearAllFilters = () => {
    setFilters({
      searchQuery: '',
      location: '',
      salaryMin: '',
      jobType: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

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
              <Bookmark className="w-8 h-8 text-violet-400" />
              <h1 className="text-3xl font-bold text-white">Việc làm đã lưu</h1>
            </div>
            <p className="text-gray-400">
              {savedJobs.length} việc làm đã được lưu
            </p>
          </div>

          {savedJobs.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="Chưa có việc làm nào được lưu"
              description="Hãy khám phá và lưu những công việc yêu thích của bạn để dễ dàng theo dõi và ứng tuyển sau này."
              action={
                <button
                  onClick={() => navigate('/jobs')}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Khám phá việc làm
                </button>
              }
            />
          ) : (
            <>
              {/* Filters Bar */}
              <div className="glass-card rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Search Input */}
                    <div className="flex-1 max-w-md flex items-center gap-2 px-4 py-2 bg-gray-900/50 rounded-xl">
                      <Search className="w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={filters.searchQuery}
                        onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                        className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-violet-500/20 text-violet-400' : ''}`}
                    >
                      <Filter className="w-5 h-5" />
                      Bộ lọc
                      {hasActiveFilters && (
                        <span className="w-2 h-2 bg-violet-500 rounded-full" />
                      )}
                    </button>
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={handleClearAllFilters}
                      className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Xóa bộ lọc
                    </button>
                  )}
                </div>

                {/* Filter Options */}
                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Địa điểm</label>
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 rounded-xl">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <select
                          value={filters.location}
                          onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                          className="flex-1 bg-transparent text-white focus:outline-none"
                        >
                          <option value="">Tất cả</option>
                          <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                          <option value="Hà Nội">Hà Nội</option>
                          <option value="Đà Nẵng">Đà Nẵng</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Mức lương tối thiểu</label>
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 rounded-xl">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <input
                          type="number"
                          placeholder="VD: 15"
                          value={filters.salaryMin}
                          onChange={(e) => setFilters(prev => ({ ...prev, salaryMin: e.target.value }))}
                          className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                        />
                        <span className="text-gray-500 text-sm">triệu</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Loại hình</label>
                      <select
                        value={filters.jobType}
                        onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-900/50 rounded-xl text-white focus:outline-none"
                      >
                        <option value="">Tất cả</option>
                        <option value="FULL_TIME">Full-time</option>
                        <option value="PART_TIME">Part-time</option>
                        <option value="CONTRACT">Contract</option>
                        <option value="INTERN">Intern</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400">
                  Hiển thị <span className="text-white font-semibold">{filteredJobs.length}</span> / {savedJobs.length} việc làm
                </p>
              </div>

              {/* Jobs List */}
              {filteredJobs.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="Không tìm thấy việc làm"
                  description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                  action={
                    <button
                      onClick={handleClearAllFilters}
                      className="btn-secondary"
                    >
                      Xóa bộ lọc
                    </button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <div key={job.id} className="relative group">
                      <JobCard
                        job={job}
                        isSaved={true}
                        onSave={() => handleUnsaveJob(job.id)}
                      />

                      {/* Quick Action Buttons */}
                      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/jobs/${job.id}`);
                          }}
                          className="p-2 bg-gray-800/90 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                          title="Xem chi tiết"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnsaveJob(job.id);
                          }}
                          className="p-2 bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/30 transition-colors"
                          title="Xóa khỏi danh sách"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
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

export default SavedJobsPage;
