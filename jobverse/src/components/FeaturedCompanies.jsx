// src/components/FeaturedCompanies.jsx
// Enhanced Featured Companies component with better UI and real data
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, MapPin, Users, Star, Briefcase, ArrowRight, Globe } from 'lucide-react';
import { companiesAPI } from '../services/api';
import { staggerContainer, staggerItem } from '../utils/animations';

const FeaturedCompanies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCompanies();
  }, []);

  const fetchFeaturedCompanies = async () => {
    try {
      const response = await companiesAPI.getFeaturedCompanies({ size: 4 });
      const data = response.data?.content || response.data || [];
      setCompanies(data.slice(0, 4));
    } catch (error) {
      console.error('Error fetching featured companies:', error);
      // Fallback data if API fails
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // Fallback placeholder while loading or if no data
  const placeholderCompanies = [
    { id: 1, name: 'VNG Corporation', industry: 'Technology', logoUrl: null, headquarters: 'Hồ Chí Minh', employeeCount: '5000+', activeJobCount: 45, ratingAvg: 4.8 },
    { id: 2, name: 'FPT Software', industry: 'IT Services', logoUrl: null, headquarters: 'Hà Nội', employeeCount: '10000+', activeJobCount: 120, ratingAvg: 4.6 },
    { id: 3, name: 'Shopee Vietnam', industry: 'E-commerce', logoUrl: null, headquarters: 'Hồ Chí Minh', employeeCount: '3000+', activeJobCount: 78, ratingAvg: 4.7 },
    { id: 4, name: 'Grab Vietnam', industry: 'Technology', logoUrl: null, headquarters: 'Hồ Chí Minh', employeeCount: '2000+', activeJobCount: 56, ratingAvg: 4.5 },
  ];

  const displayCompanies = companies.length > 0 ? companies : (loading ? [] : placeholderCompanies);

  if (loading) {
    return (
      <div className="p-5 glass-card rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Công ty nổi bật</h3>
          <div className="w-16 h-4 rounded bg-gray-700/50 animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-gray-700/50" />
              <div className="flex-1 space-y-2">
                <div className="w-24 h-4 rounded bg-gray-700/50" />
                <div className="w-16 h-3 rounded bg-gray-700/50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="p-5 glass-card rounded-2xl"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-violet-400" />
          <h3 className="font-semibold text-white">Công ty nổi bật</h3>
        </div>
        <Link 
          to="/companies" 
          className="flex items-center gap-1 text-sm transition-colors text-violet-400 hover:text-violet-300"
        >
          Xem tất cả
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      
      <div className="space-y-2">
        {displayCompanies.map((company, index) => (
          <motion.div
            key={company.id || index}
            variants={staggerItem}
            onClick={() => navigate(`/companies/${company.id}`)}
            className="flex items-center gap-3 p-3 transition-all duration-300 cursor-pointer group rounded-xl hover:bg-gray-800/50 hover:shadow-lg hover:shadow-violet-500/5"
            whileHover={{ x: 4 }}
          >
            {/* Company Logo */}
            <div className="relative flex items-center justify-center flex-shrink-0 overflow-hidden transition-transform duration-300 w-14 h-14 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 group-hover:scale-105">
              {company.logoUrl ? (
                <img 
                  src={company.logoUrl.startsWith('http') ? company.logoUrl : `http://localhost:8080/api${company.logoUrl}`}
                  alt={company.name} 
                  className="object-contain w-10 h-10"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`${company.logoUrl ? 'hidden' : 'flex'} items-center justify-center text-2xl w-full h-full`}
              >
                🏢
              </div>
              {/* Online indicator */}
              <div className="absolute w-3 h-3 border-2 rounded-full -bottom-0.5 -right-0.5 bg-emerald-500 border-gray-900" />
            </div>

            {/* Company Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white transition-colors truncate group-hover:text-violet-400">
                {company.name}
              </h4>
              <p className="text-xs text-gray-500 truncate">
                {company.industry || 'Technology'}
              </p>
              
              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                {company.headquarters && (
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" />
                    {company.headquarters}
                  </span>
                )}
                {(company.activeJobCount || company.jobCount) > 0 && (
                  <span className="flex items-center gap-0.5 text-violet-400">
                    <Briefcase className="w-3 h-3" />
                    {company.activeJobCount || company.jobCount} jobs
                  </span>
                )}
              </div>
            </div>

            {/* Rating */}
            {company.ratingAvg && (
              <div className="flex flex-col items-end flex-shrink-0">
                <div className="flex items-center gap-1 px-2 py-1 text-sm rounded-lg bg-yellow-500/10">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium text-yellow-400">{company.ratingAvg?.toFixed(1) || company.ratingAvg}</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* View All Button */}
      <motion.div 
        className="mt-4"
        variants={staggerItem}
      >
        <Link
          to="/companies"
          className="flex items-center justify-center w-full gap-2 py-2.5 text-sm font-medium transition-all duration-300 rounded-xl bg-gray-800/50 text-gray-400 hover:bg-violet-600/20 hover:text-violet-400 group"
        >
          <Globe className="w-4 h-4" />
          Khám phá tất cả công ty
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default FeaturedCompanies;
