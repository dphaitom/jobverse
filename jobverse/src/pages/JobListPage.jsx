// src/pages/JobListPage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Filter, ChevronDown, X, Briefcase, MapPin, DollarSign, 
  Clock, Building2, Sparkles
} from 'lucide-react';
import { jobsAPI, categoriesAPI, skillsAPI } from '../services/api';
import { Navbar, Footer, JobCard, SearchBar, LoadingSpinner, EmptyState } from '../components';

const JobListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    jobType: searchParams.get('jobType') || '',
    experienceLevel: searchParams.get('experience') || '',
    salaryMin: searchParams.get('salaryMin') || '',
    isRemote: searchParams.get('remote') === 'true',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [searchParams]);

  const fetchInitialData = async () => {
    try {
      const [categoriesRes, skillsRes] = await Promise.all([
        categoriesAPI.getCategories().catch(() => ({ data: [] })),
        skillsAPI.getSkills().catch(() => ({ data: [] })),
      ]);
      setCategories(categoriesRes.data || []);
      setSkills(skillsRes.data || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchParams.get('q')) params.keyword = searchParams.get('q');
      if (searchParams.get('location')) params.location = searchParams.get('location');
      if (searchParams.get('category')) params.categoryId = searchParams.get('category');
      if (searchParams.get('jobType')) params.jobType = searchParams.get('jobType');
      if (searchParams.get('experience')) params.experienceLevel = searchParams.get('experience');
      if (searchParams.get('remote') === 'true') params.isRemote = true;
      
      const response = await jobsAPI.searchJobs(params);
      setJobs(response.data?.content || response.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = ({ query, location }) => {
    const newParams = new URLSearchParams(searchParams);
    if (query) newParams.set('q', query);
    else newParams.delete('q');
    if (location) newParams.set('location', location);
    else newParams.delete('location');
    setSearchParams(newParams);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      location: '',
      category: '',
      jobType: '',
      experienceLevel: '',
      salaryMin: '',
      isRemote: false,
    });
    setSearchParams(new URLSearchParams());
  };

  const toggleSaveJob = (jobId) => {
    const newSaved = new Set(savedJobs);
    if (newSaved.has(jobId)) {
      newSaved.delete(jobId);
    } else {
      newSaved.add(jobId);
    }
    setSavedJobs(newSaved);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== '').length;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-100">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Tìm kiếm <span className="gradient-text">việc làm IT</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Hơn 10,000+ cơ hội việc làm công nghệ đang chờ bạn
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <SearchBar 
              onSearch={handleSearch}
              initialQuery={filters.query}
              initialLocation={filters.location}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="glass-card rounded-2xl p-5 sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Filter className="w-5 h-5" /> Bộ lọc
                    {activeFiltersCount > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-violet-500 text-white rounded-full">
                        {activeFiltersCount}
                      </span>
                    )}
                  </h3>
                  {activeFiltersCount > 0 && (
                    <button onClick={clearFilters} className="text-sm text-violet-400 hover:text-violet-300">
                      Xóa tất cả
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="mb-5">
                  <label className="block text-sm text-gray-400 mb-2">Danh mục</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Job Type Filter */}
                <div className="mb-5">
                  <label className="block text-sm text-gray-400 mb-2">Loại công việc</label>
                  <select
                    value={filters.jobType}
                    onChange={(e) => handleFilterChange('jobType', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Tất cả</option>
                    <option value="FULL_TIME">Full-time</option>
                    <option value="PART_TIME">Part-time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Thực tập</option>
                    <option value="FREELANCE">Freelance</option>
                  </select>
                </div>

                {/* Experience Level Filter */}
                <div className="mb-5">
                  <label className="block text-sm text-gray-400 mb-2">Kinh nghiệm</label>
                  <select
                    value={filters.experienceLevel}
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Tất cả</option>
                    <option value="ENTRY">Fresher</option>
                    <option value="JUNIOR">Junior (1-2 năm)</option>
                    <option value="MID">Mid-level (2-4 năm)</option>
                    <option value="SENIOR">Senior (4+ năm)</option>
                    <option value="LEAD">Lead/Manager</option>
                  </select>
                </div>

                {/* Remote Filter */}
                <div className="mb-5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.isRemote}
                      onChange={(e) => handleFilterChange('remote', e.target.checked ? 'true' : '')}
                      className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-violet-500 focus:ring-violet-500"
                    />
                    <span className="text-gray-300">Chỉ việc Remote</span>
                  </label>
                </div>

                {/* Salary Filter */}
                <div className="mb-5">
                  <label className="block text-sm text-gray-400 mb-2">Mức lương tối thiểu</label>
                  <select
                    value={filters.salaryMin}
                    onChange={(e) => handleFilterChange('salaryMin', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Không giới hạn</option>
                    <option value="10000000">10 triệu+</option>
                    <option value="20000000">20 triệu+</option>
                    <option value="30000000">30 triệu+</option>
                    <option value="50000000">50 triệu+</option>
                    <option value="70000000">70 triệu+</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Job List */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-gray-400">
                  Tìm thấy <span className="text-white font-semibold">{jobs.length}</span> việc làm
                </p>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 glass-card rounded-xl text-gray-400 hover:text-white"
                >
                  <Filter className="w-4 h-4" />
                  Bộ lọc {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </button>
              </div>

              {/* Active Filters Tags */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {filters.query && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-sm">
                      Từ khóa: {filters.query}
                      <X className="w-4 h-4 cursor-pointer" onClick={() => handleFilterChange('q', '')} />
                    </span>
                  )}
                  {filters.location && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-sm">
                      {filters.location}
                      <X className="w-4 h-4 cursor-pointer" onClick={() => handleFilterChange('location', '')} />
                    </span>
                  )}
                  {filters.isRemote && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                      Remote
                      <X className="w-4 h-4 cursor-pointer" onClick={() => handleFilterChange('remote', '')} />
                    </span>
                  )}
                </div>
              )}

              {/* Job Cards */}
              {loading ? (
                <LoadingSpinner size="lg" />
              ) : jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map(job => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      onSave={toggleSaveJob}
                      isSaved={savedJobs.has(job.id)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Briefcase}
                  title="Không tìm thấy việc làm"
                  description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để có kết quả tốt hơn."
                  action={
                    <button onClick={clearFilters} className="btn-primary">
                      Xóa bộ lọc
                    </button>
                  }
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JobListPage;
