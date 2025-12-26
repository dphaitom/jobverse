// src/components/index.jsx
// Shared Components

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Search, MapPin, Briefcase, Clock, DollarSign, Heart, ChevronDown,
  Bell, User, Menu, X, Rocket, Building2, LogOut, Settings,
  FileText, Bookmark, Star, Globe, Zap, Users, Filter, ChevronRight,
  ArrowRight, Sparkles, Sun, Moon
} from 'lucide-react';

// ==================== NAVBAR ====================
export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b glass-card border-gray-800/50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">JobVerse</span>
          </Link>

          <div className="items-center hidden gap-8 md:flex">
            <Link to="/jobs" className="text-gray-400 transition-colors hover:text-white">Việc làm</Link>
            <Link to="/companies" className="text-gray-400 transition-colors hover:text-white">Công ty</Link>
            <Link to="/resume-analysis" className="flex items-center gap-1 text-gray-400 transition-colors hover:text-white">
              <Sparkles className="w-4 h-4" />
              AI Resume
            </Link>
            <Link to="/interview-prep" className="flex items-center gap-1 text-gray-400 transition-colors hover:text-white">
              <Sparkles className="w-4 h-4" />
              AI Interview
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-400 transition-all duration-500 hover:text-white hover:rotate-180"
              title={isDark ? 'Chuyển sang Light mode' : 'Chuyển sang Dark mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button className="relative p-2 text-gray-400 transition-colors hover:text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute w-2 h-2 rounded-full top-1 right-1 bg-violet-500 animate-pulse" />
            </button>

            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-700/50 transition-colors"
                >
                  {user?.profile?.avatarUrl ? (
                    <img
                      src={`http://localhost:8080/api${user.profile.avatarUrl}`}
                      alt="Avatar"
                      className="object-cover w-9 h-9 rounded-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center text-sm font-semibold text-white rounded-full w-9 h-9 bg-gradient-to-r from-violet-500 to-indigo-600">
                      {user?.fullName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:block text-sm text-white max-w-[100px] truncate">
                    {user?.fullName || user?.email}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 z-50 w-56 py-2 mt-2 border border-gray-700 shadow-xl glass-card rounded-xl">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="font-medium text-white truncate">{user?.fullName}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-violet-500/20 text-violet-300 rounded-full">
                        {user?.role === 'ADMIN' ? 'Admin' : user?.role === 'EMPLOYER' ? 'Nhà tuyển dụng' : 'Ứng viên'}
                      </span>
                    </div>
                    
                    <div className="py-1">
                      <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-700/50">
                        <User className="w-4 h-4" /> Hồ sơ của tôi
                      </Link>
                      {user?.role === 'EMPLOYER' && (
                        <Link to="/employer/dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-700/50">
                          <Briefcase className="w-4 h-4" /> Quản lý tuyển dụng
                        </Link>
                      )}
                      {user?.role === 'CANDIDATE' && (
                        <>
                          <Link to="/saved-jobs" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-700/50">
                            <Bookmark className="w-4 h-4" /> Việc đã lưu
                          </Link>
                          <Link to="/my-applications" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-700/50">
                            <FileText className="w-4 h-4" /> Đã ứng tuyển
                          </Link>
                        </>
                      )}
                      <Link to="/settings" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-700/50">
                        <Settings className="w-4 h-4" /> Cài đặt
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-gray-700">
                      <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <LogOut className="w-4 h-4" /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="hidden text-gray-400 transition-colors sm:block hover:text-white">
                  Đăng nhập
                </Link>
                <Link to="/register" className="py-2 btn-primary">
                  Đăng ký
                </Link>
              </>
            )}
            
            <button className="p-2 text-gray-400 md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t md:hidden glass-card border-gray-800/50">
          <div className="px-4 py-4 space-y-2">
            <Link to="/jobs" className="block w-full px-4 py-3 text-left text-gray-400 rounded-lg hover:text-white hover:bg-gray-800/50">Việc làm</Link>
            <Link to="/companies" className="block w-full px-4 py-3 text-left text-gray-400 rounded-lg hover:text-white hover:bg-gray-800/50">Công ty</Link>
            <Link to="/resume-analysis" className="flex items-center w-full gap-2 px-4 py-3 text-left text-gray-400 rounded-lg hover:text-white hover:bg-gray-800/50">
              <Sparkles className="w-4 h-4" />
              AI Resume
            </Link>
            <Link to="/interview-prep" className="flex items-center w-full gap-2 px-4 py-3 text-left text-gray-400 rounded-lg hover:text-white hover:bg-gray-800/50">
              <Sparkles className="w-4 h-4" />
              AI Interview
            </Link>
            {!isAuthenticated && (
              <Link to="/login" className="block w-full px-4 py-3 text-left text-violet-400 hover:text-violet-300">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

// ==================== FOOTER ====================
export const Footer = () => (
  <footer className="px-4 border-t py-14 border-gray-800/30">
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-8 mb-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold gradient-text">JobVerse</span>
          </div>
          <p className="text-sm text-gray-500">Nền tảng tuyển dụng IT hàng đầu Việt Nam với AI matching thông minh.</p>
        </div>
        <div>
          <h4 className="mb-4 font-semibold text-white">Ứng viên</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><Link to="/jobs" className="hover:text-white">Tìm việc làm</Link></li>
            <li><Link to="/companies" className="hover:text-white">Công ty</Link></li>
            <li><Link to="/salary" className="hover:text-white">Tra cứu lương</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-semibold text-white">Nhà tuyển dụng</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-white">Đăng tin tuyển dụng</a></li>
            <li><a href="#" className="hover:text-white">Tìm kiếm ứng viên</a></li>
            <li><a href="#" className="hover:text-white">Báo giá dịch vụ</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-semibold text-white">Liên hệ</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>Email: contact@jobverse.vn</li>
            <li>Hotline: 1900 xxxx</li>
            <li>Địa chỉ: TP. Hồ Chí Minh</li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between gap-4 pt-8 border-t sm:flex-row border-gray-800/30">
        <p className="text-sm text-gray-500">© 2024 JobVerse. Made with ❤️ in Vietnam</p>
        <div className="flex items-center gap-4 text-gray-500">
          <a href="#" className="hover:text-white">Điều khoản</a>
          <a href="#" className="hover:text-white">Bảo mật</a>
        </div>
      </div>
    </div>
  </footer>
);

// ==================== JOB CARD ====================
export const JobCard = ({ job, onSave, isSaved }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="p-5 cursor-pointer job-card glass-card rounded-2xl hover:bg-gray-800/40 group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(139, 92, 246, 0.15)",
        transition: { duration: 0.2 }
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex items-center justify-center flex-shrink-0 text-2xl w-14 h-14 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900">
          {job.company?.logoUrl ? (
            <img src={job.company.logoUrl} alt={job.company.name} className="object-contain w-10 h-10" />
          ) : (
            '🏢'
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-violet-400">
                  {job.title}
                </h3>
                {job.isUrgent && (
                  <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Urgent
                  </span>
                )}
                {job.isFeatured && (
                  <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> Hot
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">{job.company?.name}</p>
            </div>
            {job.matchScore && <MatchScoreRing score={job.matchScore} />}
          </div>

          <div className="flex flex-wrap mb-3 text-sm text-gray-500 gap-x-4 gap-y-1">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
            <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />
              {job.salaryMin && job.salaryMax 
                ? `${(job.salaryMin/1000000).toFixed(0)}-${(job.salaryMax/1000000).toFixed(0)} triệu`
                : 'Thỏa thuận'}
            </span>
            <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.jobType?.replace('_', ' ')}</span>
            {job.isRemote && (
              <span className="flex items-center gap-1 text-green-400"><Globe className="w-3.5 h-3.5" />Remote</span>
            )}
          </div>

          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.slice(0, 4).map((skill, idx) => (
                <span key={idx} className="skill-pill">{skill.name || skill}</span>
              ))}
              {job.skills.length > 4 && (
                <span className="skill-pill">+{job.skills.length - 4}</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-800/50">
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              {job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : 'Mới đăng'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onSave && onSave(job.id); }}
                className={`p-2 rounded-xl transition-all ${
                  isSaved
                    ? 'bg-violet-500/20 text-violet-400'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              <button className="py-2 text-sm btn-primary">
                Ứng tuyển <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ==================== COMPANY CARD ====================
export const CompanyCard = ({ company }) => {
  const navigate = useNavigate();
  
  return (
    <div 
      onClick={() => navigate(`/companies/${company.id}`)}
      className="p-5 cursor-pointer glass-card rounded-2xl hover:bg-gray-800/40 group"
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center flex-shrink-0 w-16 h-16 text-3xl rounded-xl bg-gradient-to-br from-gray-800 to-gray-900">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt={company.name} className="object-contain w-12 h-12" />
          ) : (
            '🏢'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="mb-1 text-lg font-semibold text-white transition-colors group-hover:text-violet-400">
            {company.name}
          </h3>
          <p className="mb-2 text-sm text-gray-400">{company.industry}</p>
          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />{company.headquarters || company.location}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />{company.employeeCount || '100+'} nhân viên
            </span>
            {company.ratingAvg && (
              <span className="flex items-center gap-1 text-yellow-400">
                <Star className="w-3.5 h-3.5 fill-current" />{company.ratingAvg}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-800/50">
        <span className="text-sm text-gray-500">{company.jobCount || 0} việc làm đang tuyển</span>
        <ChevronRight className="w-5 h-5 text-gray-500 transition-colors group-hover:text-violet-400" />
      </div>
    </div>
  );
};

// ==================== MATCH SCORE RING ====================
export const MatchScoreRing = ({ score }) => {
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex-shrink-0 w-20 h-20">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="36" stroke="rgba(139, 92, 246, 0.15)" strokeWidth="6" fill="none" />
        <circle
          cx="50" cy="50" r="36"
          stroke="url(#scoreGradient)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-white">{score}%</span>
        <span className="text-[10px] text-gray-500">Match</span>
      </div>
    </div>
  );
};

// ==================== SEARCH BAR ====================
export const SearchBar = ({ onSearch, initialQuery = '', initialLocation = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ query, location });
    } else {
      navigate(`/jobs?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
      <div className="p-2 glass-card rounded-2xl">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex items-center flex-1 gap-3 px-4 py-3 bg-gray-900/50 rounded-xl">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm vị trí, công ty, kỹ năng..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-white placeholder-gray-500 bg-transparent focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-900/50 rounded-xl">
            <MapPin className="w-5 h-5 text-gray-500" />
            <select 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="text-gray-300 bg-transparent cursor-pointer focus:outline-none"
            >
              <option value="">Tất cả địa điểm</option>
              <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
            </select>
          </div>
          <button type="submit" className="flex items-center justify-center gap-2 btn-primary">
            <Search className="w-5 h-5" />
            <span>Tìm kiếm</span>
          </button>
        </div>
      </div>
    </form>
  );
};

// ==================== LOADING SPINNER ====================
export const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizeClasses[size]} border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin`} />
    </div>
  );
};

// ==================== EMPTY STATE ====================
export const EmptyState = ({ icon: Icon = Briefcase, title, description, action }) => (
  <div className="flex flex-col items-center justify-center px-4 py-16">
    <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-2xl bg-gray-800/50">
      <Icon className="w-10 h-10 text-gray-600" />
    </div>
    <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
    <p className="max-w-md mb-6 text-center text-gray-500">{description}</p>
    {action}
  </div>
);

// ==================== PROTECTED ROUTE ====================
export const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
    if (!loading && isAuthenticated && roles.length > 0 && !roles.includes(user?.role)) {
      navigate('/');
    }
  }, [loading, isAuthenticated, user, roles, navigate]);

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return null;
  }

  return children;
};
