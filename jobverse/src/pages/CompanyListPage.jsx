// src/pages/CompanyListPage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Building2, MapPin, Users, Star, Briefcase, ArrowRight } from 'lucide-react';
import { companiesAPI } from '../services/api';
import { Navbar, Footer, CompanyCard, LoadingSpinner, EmptyState } from '../components';
import AnimatedBackground from '../components/AnimatedBackground';
import { useTheme } from '../contexts/ThemeContext';
import { staggerContainer, staggerItem, fadeInUp } from '../utils/animations';

const CompanyListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [companies, setCompanies] = useState([]);
  const [featuredCompanies, setFeaturedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [industry, setIndustry] = useState(searchParams.get('industry') || '');

  useEffect(() => {
    fetchCompanies();
  }, [searchParams]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchParams.get('q')) params.keyword = searchParams.get('q');
      if (searchParams.get('industry')) params.industry = searchParams.get('industry');
      
      const response = await companiesAPI.getCompanies(params);
      const allCompanies = response.data?.content || response.data || [];
      setCompanies(allCompanies);
      // Set top 4 as featured
      setFeaturedCompanies(allCompanies.slice(0, 4));
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set('q', searchQuery);
    if (industry) newParams.set('industry', industry);
    setSearchParams(newParams);
  };

  const industries = [
    'Information Technology',
    'Technology',
    'E-commerce',
    'Fintech',
    'Gaming',
    'Software',
    'Consulting',
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0b]' : 'bg-slate-50'} text-gray-100 transition-colors duration-500`}>
      <AnimatedBackground />
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Khám phá <span className="gradient-text">công ty hàng đầu</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Tìm hiểu về các công ty công nghệ tốt nhất và cơ hội việc làm tại đây
            </p>
          </div>

          {/* Search & Filter */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-10">
            <div className="glass-card rounded-2xl p-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-900/50 rounded-xl">
                  <Search className="w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Tìm tên công ty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-900/50 rounded-xl">
                  <Building2 className="w-5 h-5 text-gray-500" />
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="bg-transparent text-gray-300 focus:outline-none cursor-pointer"
                  >
                    <option value="">Tất cả ngành</option>
                    {industries.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn-primary flex items-center justify-center gap-2">
                  <Search className="w-5 h-5" />
                  <span>Tìm kiếm</span>
                </button>
              </div>
            </div>
          </form>

          {/* Featured Companies - Using real data */}
          {featuredCompanies.length > 0 && (
            <motion.div 
              className="mb-10"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.h2 
                className="text-xl font-semibold text-white mb-5 flex items-center gap-2"
                variants={fadeInUp}
              >
                <Star className="w-5 h-5 text-yellow-400" />
                Công ty nổi bật
              </motion.h2>
              <div className="grid md:grid-cols-4 gap-4">
                {featuredCompanies.map((company, idx) => (
                  <motion.div 
                    key={company.id || idx} 
                    variants={staggerItem}
                    onClick={() => navigate(`/companies/${company.id}`)}
                    className="glass-card rounded-xl p-4 cursor-pointer group transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10"
                    whileHover={{ 
                      y: -4,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                        {company.logoUrl ? (
                          <img 
                            src={company.logoUrl.startsWith('http') ? company.logoUrl : `http://localhost:8080/api${company.logoUrl}`}
                            alt={company.name} 
                            className="w-10 h-10 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span className={`${company.logoUrl ? 'hidden' : 'flex'} text-2xl`}>🏢</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate group-hover:text-violet-400 transition-colors">
                          {company.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">{company.industry || 'Technology'}</p>
                        {company.ratingAvg && (
                          <div className="flex items-center gap-1 text-sm text-yellow-400 mt-0.5">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{company.ratingAvg?.toFixed(1) || company.ratingAvg}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        {company.activeJobCount || company.jobCount || 0} việc làm
                      </span>
                      {company.headquarters && (
                        <span className="text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {company.headquarters}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Company List */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-white">
                Tất cả công ty ({companies.length})
              </h2>
            </div>

            {loading ? (
              <LoadingSpinner size="lg" />
            ) : companies.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {companies.map(company => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Building2}
                title="Không tìm thấy công ty"
                description="Thử thay đổi từ khóa tìm kiếm để có kết quả tốt hơn."
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CompanyListPage;
