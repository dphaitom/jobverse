// src/components/auth/UserMenu.jsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  User,
  Settings,
  FileText,
  Bookmark,
  Bell,
  LogOut,
  ChevronDown,
  Building2,
  Briefcase,
  LayoutDashboard
} from 'lucide-react';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  const isEmployer = user.role === 'EMPLOYER';
  const isAdmin = user.role === 'ADMIN';

  const menuItems = [
    ...(isAdmin ? [
      { icon: LayoutDashboard, label: 'Admin Dashboard', href: '/admin' },
      { divider: true },
    ] : []),
    ...(isEmployer ? [
      { icon: Building2, label: 'Dashboard công ty', href: '/employer/dashboard' },
      { icon: Briefcase, label: 'Quản lý tin tuyển dụng', href: '/employer/jobs' },
      { divider: true },
    ] : []),
    { icon: User, label: 'Hồ sơ của tôi', href: '/profile' },
    ...(!isEmployer && !isAdmin ? [
      { icon: FileText, label: 'CV của tôi', href: '/my-resumes' },
      { icon: Bookmark, label: 'Việc đã lưu', href: '/saved-jobs' },
      { icon: Briefcase, label: 'Việc đã ứng tuyển', href: '/my-applications' },
    ] : []),
    { icon: Bell, label: 'Thông báo', href: '/notifications', badge: 3 },
    { icon: Settings, label: 'Cài đặt', href: '/settings' },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-700/50 transition-colors"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
          {user.fullName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
        </div>
        
        {/* Name (hidden on mobile) */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-white truncate max-w-[120px]">
            {user.fullName || 'User'}
          </p>
          <p className="text-xs text-gray-400">
            {isAdmin ? 'Admin' : isEmployer ? 'Nhà tuyển dụng' : 'Ứng viên'}
          </p>
        </div>
        
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-xl py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-700">
            <p className="font-medium text-white">{user.fullName || 'User'}</p>
            <p className="text-sm text-gray-400 truncate">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => {
              if (item.divider) {
                return <div key={index} className="my-2 border-t border-gray-700" />;
              }

              return (
                <Link
                  key={index}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-700 pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
