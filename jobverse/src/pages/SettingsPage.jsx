// src/pages/SettingsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings, User, Lock, Bell, Eye, EyeOff, Save, Mail,
  Smartphone, Globe, Shield, LogOut, Trash2, Sun, Moon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { userAPI } from '../services/api';
import { Navbar, Footer, LoadingSpinner } from '../components';
import AnimatedBackground from '../components/AnimatedBackground';

const SettingsPage = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile settings
  const [profileData, setProfileData] = useState({
    fullName: '',
    phone: '',
    email: '',
  });

  // Security settings
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    jobAlerts: true,
    applicationUpdates: true,
    newsletterSubscription: false,
    smsNotifications: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadUserSettings();
  }, [isAuthenticated]);

  const loadUserSettings = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getProfile();
      const data = response.data;
      setProfileData({
        fullName: data.fullName || data.profile?.fullName || '',
        phone: data.phone || '',
        email: data.email || '',
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      await userAPI.updateProfile(profileData);
      toast.success('Cập nhật thông tin thành công! ✨');
    } catch (error) {
      toast.error('Lỗi cập nhật: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (securityData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      // Call API to change password
      // await userAPI.changePassword(securityData);
      toast.success('Đổi mật khẩu thành công! 🔒');
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Lỗi đổi mật khẩu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    try {
      // Call API to update notification settings
      // await userAPI.updateNotificationSettings(notificationSettings);
      toast.success('Cập nhật cài đặt thông báo thành công! 🔔');
    } catch (error) {
      toast.error('Lỗi cập nhật: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!')) {
      toast.error('Tính năng xóa tài khoản tạm thời bị vô hiệu hóa');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Hồ sơ', icon: User },
    { id: 'security', label: 'Bảo mật', icon: Lock },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
  ];

  if (loading && !user) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0b]' : 'bg-slate-50'} text-gray-100`}>
        <Navbar />
        <div className="pt-24"><LoadingSpinner size="lg" /></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0b]' : 'bg-slate-50'} text-gray-100 transition-colors duration-500`}>
      <AnimatedBackground />
      <Navbar />

      <main className="px-4 pt-24 pb-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-8 h-8 text-violet-400" />
              <h1 className="text-3xl font-bold text-white">Cài đặt</h1>
            </div>
            <p className="text-gray-400">
              Quản lý thông tin cá nhân và tùy chọn tài khoản
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-1">
              <div className="p-2 space-y-1 glass-card rounded-2xl">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        activeTab === tab.id
                          ? 'bg-violet-500/20 text-violet-400'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-6 glass-card rounded-2xl">
                  <h2 className="mb-6 text-xl font-semibold text-white">Thông tin cá nhân</h2>

                  <div className="space-y-5">
                    <div>
                      <label className="block mb-2 text-sm text-gray-400">Họ và tên</label>
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-900/50 rounded-xl">
                        <User className="w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                          className="flex-1 text-white bg-transparent focus:outline-none"
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm text-gray-400">Email</label>
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-900/50 rounded-xl">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                          className="flex-1 text-gray-500 bg-transparent cursor-not-allowed"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Email không thể thay đổi</p>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm text-gray-400">Số điện thoại</label>
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-900/50 rounded-xl">
                        <Smartphone className="w-5 h-5 text-gray-500" />
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="flex-1 text-white bg-transparent focus:outline-none"
                          placeholder="0912345678"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                      <h3 className="mb-3 text-sm font-medium text-white">Giao diện</h3>
                      <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          {theme === 'dark' ? (
                            <Moon className="w-5 h-5 text-violet-400" />
                          ) : (
                            <Sun className="w-5 h-5 text-yellow-400" />
                          )}
                          <div>
                            <p className="font-medium text-white">Chế độ {theme === 'dark' ? 'Tối' : 'Sáng'}</p>
                            <p className="text-xs text-gray-400">Thay đổi giao diện hiển thị</p>
                          </div>
                        </div>
                        <button
                          onClick={toggleTheme}
                          className="px-4 py-2 btn-secondary"
                        >
                          Đổi sang {theme === 'dark' ? 'Sáng' : 'Tối'}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleProfileUpdate}
                      disabled={loading}
                      className="flex items-center justify-center w-full gap-2 py-3 btn-primary"
                    >
                      <Save className="w-5 h-5" />
                      {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-6 glass-card rounded-2xl">
                  <h2 className="mb-6 text-xl font-semibold text-white">Bảo mật</h2>

                  <div className="space-y-5">
                    <div>
                      <label className="block mb-2 text-sm text-gray-400">Mật khẩu hiện tại</label>
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-900/50 rounded-xl">
                        <Lock className="w-5 h-5 text-gray-500" />
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={securityData.currentPassword}
                          onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                          className="flex-1 text-white bg-transparent focus:outline-none"
                          placeholder="••••••••"
                        />
                        <button
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          className="text-gray-500 hover:text-white"
                        >
                          {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm text-gray-400">Mật khẩu mới</label>
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-900/50 rounded-xl">
                        <Lock className="w-5 h-5 text-gray-500" />
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={securityData.newPassword}
                          onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                          className="flex-1 text-white bg-transparent focus:outline-none"
                          placeholder="••••••••"
                        />
                        <button
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          className="text-gray-500 hover:text-white"
                        >
                          {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm text-gray-400">Xác nhận mật khẩu mới</label>
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-900/50 rounded-xl">
                        <Lock className="w-5 h-5 text-gray-500" />
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={securityData.confirmPassword}
                          onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                          className="flex-1 text-white bg-transparent focus:outline-none"
                          placeholder="••••••••"
                        />
                        <button
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          className="text-gray-500 hover:text-white"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handlePasswordChange}
                      disabled={loading}
                      className="flex items-center justify-center w-full gap-2 py-3 btn-primary"
                    >
                      <Shield className="w-5 h-5" />
                      {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                    </button>

                    <div className="pt-6 border-t border-gray-700">
                      <h3 className="flex items-center gap-2 mb-3 text-sm font-medium text-white">
                        <Trash2 className="w-5 h-5 text-red-400" />
                        Vùng nguy hiểm
                      </h3>
                      <div className="p-4 border bg-red-500/10 border-red-500/30 rounded-xl">
                        <p className="mb-3 text-sm text-gray-300">
                          Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn. Hành động này không thể hoàn tác.
                        </p>
                        <button
                          onClick={handleDeleteAccount}
                          className="px-4 py-2 text-red-400 btn-secondary bg-red-500/20 hover:bg-red-500/30"
                        >
                          Xóa tài khoản
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="p-6 glass-card rounded-2xl">
                  <h2 className="mb-6 text-xl font-semibold text-white">Cài đặt thông báo</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
                      <div>
                        <p className="font-medium text-white">Thông báo Email</p>
                        <p className="text-sm text-gray-400">Nhận thông báo qua email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailNotifications}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
                      <div>
                        <p className="font-medium text-white">Cảnh báo việc làm</p>
                        <p className="text-sm text-gray-400">Nhận thông báo về việc làm mới phù hợp</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.jobAlerts}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, jobAlerts: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
                      <div>
                        <p className="font-medium text-white">Cập nhật đơn ứng tuyển</p>
                        <p className="text-sm text-gray-400">Thông báo khi có thay đổi trạng thái đơn</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.applicationUpdates}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, applicationUpdates: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
                      <div>
                        <p className="font-medium text-white">Thông báo SMS</p>
                        <p className="text-sm text-gray-400">Nhận thông báo qua tin nhắn</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.smsNotifications}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
                      <div>
                        <p className="font-medium text-white">Đăng ký nhận tin</p>
                        <p className="text-sm text-gray-400">Nhận bản tin và cập nhật từ JobVerse</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.newsletterSubscription}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, newsletterSubscription: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                      </label>
                    </div>

                    <button
                      onClick={handleNotificationUpdate}
                      disabled={loading}
                      className="flex items-center justify-center w-full gap-2 py-3 mt-6 btn-primary"
                    >
                      <Save className="w-5 h-5" />
                      {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SettingsPage;
