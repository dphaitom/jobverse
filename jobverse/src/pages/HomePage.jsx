// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, Sparkles,
  Users, TrendingUp, Star, Building2, ArrowRight, CheckCircle2,
  Globe, Code, Palette, BarChart3
} from 'lucide-react';
import { jobsAPI, categoriesAPI, skillsAPI } from '../services/api';
import { Navbar, Footer, JobCard, SearchBar } from '../components';
import AIChat from '../components/AIChat';
import AnimatedBackground from '../components/AnimatedBackground';
import FeaturedCompanies from '../components/FeaturedCompanies';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '../utils/animations';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trendingSkills, setTrendingSkills] = useState([]);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    fetchData();
    if (isAuthenticated && user?.role === 'CANDIDATE') {
      fetchSavedAndAppliedJobs();
    }
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    try {
      const [jobsRes, categoriesRes, skillsRes] = await Promise.all([
        jobsAPI.getJobs({ size: 6 }).catch(() => ({ data: [] })),
        categoriesAPI.getCategories().catch(() => ({ data: [] })),
        skillsAPI.getTrendingSkills().catch(() => ({ data: [] })),
      ]);
      
      setJobs(jobsRes.data?.content || jobsRes.data || []);
      setCategories(categoriesRes.data || []);
      setTrendingSkills(skillsRes.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedAndAppliedJobs = async () => {
    try {
      const [savedIdsRes, appliedRes] = await Promise.all([
        jobsAPI.getSavedJobs().catch(() => ({ data: { content: [] } })),
        jobsAPI.getMyApplications().catch(() => ({ data: [] })),
      ]);

      // Handle saved jobs
      const savedJobsData = savedIdsRes.data?.content || savedIdsRes.data || [];
      const savedIds = Array.isArray(savedJobsData) 
        ? savedJobsData.map(job => job.id) 
        : [];
      setSavedJobs(new Set(savedIds));

      // Handle applied jobs
      const appliedData = appliedRes.data || [];
      const appliedIds = Array.isArray(appliedData) 
        ? appliedData.map(app => app.jobId) 
        : [];
      setAppliedJobIds(new Set(appliedIds));
    } catch (error) {
      console.error('Error fetching saved/applied jobs:', error);
    }
  };

  const toggleSaveJob = async (jobId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const newSaved = new Set(savedJobs);
      if (newSaved.has(jobId)) {
        await jobsAPI.unsaveJob(jobId);
        newSaved.delete(jobId);
      } else {
        await jobsAPI.saveJob(jobId);
        newSaved.add(jobId);
      }
      setSavedJobs(newSaved);
    } catch (error) {
      console.error('Error toggling save job:', error);
    }
  };

  const handleSearch = ({ query, location }) => {
    navigate(`/jobs?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
  };

  // Default categories if API fails
  const defaultCategories = [
    { id: 'all', name: 'Tất cả', icon: Sparkles },
    { id: 'tech', name: 'Công nghệ', icon: Code },
    { id: 'design', name: 'Thiết kế', icon: Palette },
    { id: 'marketing', name: 'Marketing', icon: TrendingUp },
    { id: 'finance', name: 'Tài chính', icon: BarChart3 },
    { id: 'remote', name: 'Remote', icon: Globe },
  ];

  const displayCategories = categories.length > 0 
    ? [{ id: 'all', name: 'Tất cả', icon: 'sparkles' }, ...categories]
    : defaultCategories;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0b]' : 'bg-slate-50'} text-gray-100 transition-colors duration-500`}>
      {/* Animated Background */}
      <AnimatedBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="relative px-4 pb-16 overflow-hidden pt-28">
        <div className="absolute rounded-full top-20 left-10 w-72 h-72 bg-violet-500/20 blur-3xl animate-pulse" />
        <div className="absolute rounded-full bottom-10 right-10 w-96 h-96 bg-indigo-500/15 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full glass-card"
              {...fadeInUp}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-gray-300">Powered by AI Matching</span>
            </motion.div>

            <motion.h1
              className="mb-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
              {...fadeInUp}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="text-white">Tìm công việc </span>
              <span className="gradient-text">mơ ước</span>
              <br />
              <span className="text-white">trong </span>
              <span className="gradient-text">vài giây</span>
            </motion.h1>

            <motion.p
              className="max-w-2xl mx-auto mb-10 text-lg text-gray-400"
              {...fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              AI phân tích hồ sơ và đề xuất việc làm phù hợp nhất với bạn.
              Hơn <span className="font-semibold text-violet-400">50,000+</span> cơ hội đang chờ đợi.
            </motion.p>

            {/* Search Bar */}
            <SearchBar onSearch={handleSearch} />

            {/* Quick Tags */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <span className="text-sm text-gray-500">Phổ biến:</span>
              {['React Developer', 'Product Designer', 'Data Analyst'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/jobs?q=${encodeURIComponent(tag)}`)}
                  className="px-4 py-1.5 text-sm text-gray-400 bg-gray-800/50 hover:bg-gray-800 rounded-full transition-all hover:text-white"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 gap-4 mt-16 md:grid-cols-4"
            {...staggerContainer}
          >
            {[
              { label: 'Việc làm', value: '50,000+', icon: Briefcase },
              { label: 'Công ty', value: '2,500+', icon: Building2 },
              { label: 'Ứng viên', value: '500,000+', icon: Users },
              { label: 'Đã tuyển', value: '98%', icon: CheckCircle2 },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="p-5 text-center transition-colors glass-card rounded-2xl group hover:bg-gray-800/30"
                {...staggerItem}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20">
                  <stat.icon className="w-6 h-6 text-violet-400" />
                </div>
                <div className="mb-1 text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 py-8 border-t border-gray-800/30">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3 pb-2 overflow-x-auto scrollbar-hide">
            {displayCategories.slice(0, 8).map((cat) => {
              const IconComponent = cat.icon || Sparkles;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                      : 'glass-card text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {typeof IconComponent === 'function' ? <IconComponent className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  <span className="font-medium">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Job List */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Việc làm phù hợp với bạn</h2>
                  <p className="mt-1 text-sm text-gray-500">{jobs.length} công việc</p>
                </div>
                <Link to="/jobs" className="flex items-center gap-1 text-violet-400 hover:text-violet-300">
                  Xem tất cả <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 rounded-full border-violet-500/30 border-t-violet-500 animate-spin" />
                </div>
              ) : jobs.length > 0 ? (
                jobs.map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onSave={toggleSaveJob}
                    isSaved={savedJobs.has(job.id)}
                    isApplied={appliedJobIds.has(job.id)}
                    userRole={user?.role}
                  />
                ))
              ) : (
                <div className="py-12 text-center glass-card rounded-2xl">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">Chưa có việc làm nào</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Assistant Info */}
              <div className="p-5 glass-card rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">AI Career Coach</h3>
                    <p className="text-sm text-gray-500">Tư vấn sự nghiệp 24/7</p>
                  </div>
                </div>
                <button onClick={() => setShowAI(true)}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all">
                  Mở AI Coach
                </button>
              </div>

              {/* Trending Skills */}
              <div className="p-5 glass-card rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-violet-400" />
                  <h3 className="font-semibold text-white">Kỹ năng đang hot</h3>
                </div>
                <div className="space-y-2">
                  {(trendingSkills.length > 0 ? trendingSkills : [
                    { name: 'React', growth: '+45%', hot: true },
                    { name: 'AI/ML', growth: '+120%', hot: true },
                    { name: 'Cloud', growth: '+38%', hot: false },
                    { name: 'DevOps', growth: '+52%', hot: true },
                    { name: 'UI/UX', growth: '+28%', hot: false },
                  ]).map((skill, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 cursor-pointer rounded-xl bg-gray-800/30 hover:bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        {skill.hot && <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />}
                        <span className="text-gray-300">{skill.name}</span>
                      </div>
                      <span className="text-sm text-green-400">{skill.growth || '+N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured Companies - Using new component */}
              <FeaturedCompanies />
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* AI Chat Component */}
      <AIChat isOpen={showAI} onClose={() => setShowAI(false)} />
    </div>
  );
};

export default HomePage;
