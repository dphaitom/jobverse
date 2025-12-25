// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Briefcase, Building2, TrendingUp, CheckCircle, XCircle,
  Clock, DollarSign, Eye, AlertCircle, Activity, BarChart3
} from 'lucide-react';
import { Navbar, Footer, LoadingSpinner } from '../components';
import { authAPI } from '../services/api';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, jobsRes, usersRes] = await Promise.all([
        authAPI.get('/v1/admin/stats'),
        authAPI.get('/v1/admin/jobs/recent?size=5'),
        authAPI.get('/v1/admin/users/recent?size=5')
      ]);

      setStats(statsRes.data);
      setRecentJobs(jobsRes.data?.content || []);
      setRecentUsers(usersRes.data?.content || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-gray-100">
        <Navbar />
        <div className="pt-24">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Tổng người dùng',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'violet',
      trend: '+12% tháng này'
    },
    {
      label: 'Việc làm đang mở',
      value: stats?.activeJobs || 0,
      icon: Briefcase,
      color: 'blue',
      trend: '+8% tháng này'
    },
    {
      label: 'Công ty',
      value: stats?.totalCompanies || 0,
      icon: Building2,
      color: 'green',
      trend: '+5% tháng này'
    },
    {
      label: 'Đơn ứng tuyển',
      value: stats?.totalApplications || 0,
      icon: TrendingUp,
      color: 'orange',
      trend: '+23% tháng này'
    },
    {
      label: 'Việc chờ duyệt',
      value: stats?.pendingJobs || 0,
      icon: Clock,
      color: 'yellow',
      trend: 'Cần xử lý'
    },
    {
      label: 'Doanh thu tháng này',
      value: `${(stats?.monthlyRevenue || 0) / 1000000}M VNĐ`,
      icon: DollarSign,
      color: 'emerald',
      trend: '+15% so với tháng trước'
    }
  ];

  const quickActions = [
    {
      label: 'Duyệt việc làm',
      description: 'Xem và duyệt việc làm chờ phê duyệt',
      icon: CheckCircle,
      color: 'violet',
      onClick: () => navigate('/admin/jobs/pending')
    },
    {
      label: 'Quản lý người dùng',
      description: 'Xem, chỉnh sửa và quản lý tài khoản',
      icon: Users,
      color: 'blue',
      onClick: () => navigate('/admin/users')
    },
    {
      label: 'Báo cáo & Thống kê',
      description: 'Xem báo cáo chi tiết và phân tích',
      icon: BarChart3,
      color: 'green',
      onClick: () => navigate('/admin/reports')
    },
    {
      label: 'Xử lý khiếu nại',
      description: 'Xem và xử lý khiếu nại từ người dùng',
      icon: AlertCircle,
      color: 'red',
      onClick: () => navigate('/admin/complaints')
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      violet: 'from-violet-500/20 to-violet-600/20 border-violet-500/30 text-violet-400',
      blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
      green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
      orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400',
      yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400',
      emerald: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400',
      red: 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400'
    };
    return colors[color] || colors.violet;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-100">
      <Navbar />

      <main className="px-4 pt-24 pb-16">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            className="mb-8"
            {...fadeInUp}
          >
            <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
              Admin Dashboard
            </h1>
            <p className="text-gray-400">
              Quản lý và giám sát hệ thống JobVerse
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3"
            {...staggerContainer}
          >
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                {...staggerItem}
                transition={{ delay: index * 0.1 }}
                className={`glass-card rounded-2xl p-6 border bg-gradient-to-br ${getColorClasses(stat.color)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gray-800/50">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-gray-400">{stat.trend}</span>
                </div>
                <h3 className="mb-1 text-3xl font-bold text-white">{stat.value}</h3>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="mb-8"
            {...fadeInUp}
            transition={{ delay: 0.3 }}
          >
            <h2 className="mb-4 text-xl font-semibold text-white">Hành động nhanh</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <motion.button
                  key={action.label}
                  onClick={action.onClick}
                  className={`glass-card rounded-xl p-5 text-left hover:bg-gray-800/40 transition-all border bg-gradient-to-br ${getColorClasses(action.color)}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <action.icon className="w-8 h-8 mb-3" />
                  <h3 className="mb-1 font-semibold text-white">{action.label}</h3>
                  <p className="text-xs text-gray-400">{action.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Recent Jobs */}
            <motion.div
              className="p-6 glass-card rounded-2xl"
              {...fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Việc làm mới nhất</h2>
                <button
                  onClick={() => navigate('/admin/jobs')}
                  className="text-sm text-violet-400 hover:text-violet-300"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="space-y-3">
                {recentJobs.length === 0 ? (
                  <p className="py-8 text-center text-gray-400">Chưa có việc làm nào</p>
                ) : (
                  recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-start gap-3 p-3 transition-colors cursor-pointer rounded-xl hover:bg-gray-800/40"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900">
                        <Briefcase className="w-6 h-6 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">{job.title}</h3>
                        <p className="text-sm text-gray-400">{job.company?.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            job.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                            job.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Recent Users */}
            <motion.div
              className="p-6 glass-card rounded-2xl"
              {...fadeInUp}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Người dùng mới</h2>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="text-sm text-violet-400 hover:text-violet-300"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="space-y-3">
                {recentUsers.length === 0 ? (
                  <p className="py-8 text-center text-gray-400">Chưa có người dùng mới</p>
                ) : (
                  recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 transition-colors cursor-pointer rounded-xl hover:bg-gray-800/40"
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                    >
                      <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 font-semibold text-white rounded-full bg-gradient-to-r from-violet-500 to-indigo-600">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">{user.email}</h3>
                        <p className="text-sm text-gray-400">
                          {user.role === 'ADMIN' ? 'Admin' : user.role === 'EMPLOYER' ? 'Nhà tuyển dụng' : 'Ứng viên'}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        user.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {user.active ? 'Active' : 'Banned'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
