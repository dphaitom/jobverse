// src/pages/CompanyListPage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Building2, MapPin, Users, Star } from 'lucide-react';
import { companiesAPI } from '../services/api';
import { Navbar, Footer, CompanyCard, LoadingSpinner, EmptyState } from '../components';

const CompanyListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [companies, setCompanies] = useState([]);
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
      setCompanies(response.data?.content || response.data || []);
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
    <div className="min-h-screen bg-[#0a0a0b] text-gray-100">
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

          {/* Featured Companies */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-5">Công ty nổi bật</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { name: 'FPT Software', logo: '💻', jobs: 120, rating: 4.6 },
                { name: 'VNG Corporation', logo: '🎮', jobs: 45, rating: 4.8 },
                { name: 'Shopee', logo: '🛒', jobs: 78, rating: 4.5 },
                { name: 'MoMo', logo: '💰', jobs: 32, rating: 4.3 },
              ].map((company, idx) => (
                <div key={idx} className="glass-card rounded-xl p-4 hover:bg-gray-800/40 cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-2xl">
                      {company.logo}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{company.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-yellow-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{company.rating}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">{company.jobs} việc làm đang tuyển</p>
                </div>
              ))}
            </div>
          </div>

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
