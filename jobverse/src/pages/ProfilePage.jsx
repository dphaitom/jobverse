// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Briefcase, Calendar, Edit2,
  Save, X, Camera, Github, Linkedin, Globe, Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Navbar, Footer, LoadingSpinner } from '../components';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: '',
    bio: '',
    currentPosition: '',
    experienceYears: 0,
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    openToWork: false,
    openToRemote: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      const data = response.data;
      setProfile(data);
      setFormData({
        fullName: data.profile?.fullName || data.fullName || '',
        phone: data.phone || '',
        city: data.profile?.city || '',
        bio: data.profile?.bio || '',
        currentPosition: data.profile?.currentPosition || '',
        experienceYears: data.profile?.experienceYears || 0,
        linkedinUrl: data.profile?.linkedinUrl || '',
        githubUrl: data.profile?.githubUrl || '',
        portfolioUrl: data.profile?.portfolioUrl || '',
        openToWork: data.profile?.openToWork || false,
        openToRemote: data.profile?.openToRemote || false,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await userAPI.updateProfile(formData);
      setEditing(false);
      fetchProfile();
      toast.success('Cập nhật profile thành công! ✨');
    } catch (error) {
      toast.error('Lỗi cập nhật: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

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
      
      <main className="px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header Card */}
          <div className="p-6 mb-6 glass-card rounded-2xl">
            <div className="flex flex-col gap-6 md:flex-row">
              {/* Avatar */}
              <div className="relative">
                <div className="flex items-center justify-center w-32 h-32 text-5xl font-bold text-white rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600">
                  {formData.fullName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </div>
                <button className="absolute p-2 text-white transition-colors -bottom-2 -right-2 bg-violet-500 rounded-xl hover:bg-violet-600">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="mb-1 text-2xl font-bold text-white">
                      {formData.fullName || 'Chưa cập nhật tên'}
                    </h1>
                    <p className="text-gray-400">{formData.currentPosition || 'Chưa có vị trí'}</p>
                  </div>
                  <button
                    onClick={() => editing ? handleSave() : setEditing(true)}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 btn-primary"
                  >
                    {saving ? (
                      'Đang lưu...'
                    ) : editing ? (
                      <><Save className="w-4 h-4" /> Lưu</>
                    ) : (
                      <><Edit2 className="w-4 h-4" /> Chỉnh sửa</>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" /> {user?.email}
                  </span>
                  {formData.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4" /> {formData.phone}
                    </span>
                  )}
                  {formData.city && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" /> {formData.city}
                    </span>
                  )}
                </div>

                {/* Status Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.openToWork && (
                    <span className="px-3 py-1 text-sm text-green-400 rounded-full bg-green-500/20">
                      🟢 Đang tìm việc
                    </span>
                  )}
                  {formData.openToRemote && (
                    <span className="px-3 py-1 text-sm text-blue-400 rounded-full bg-blue-500/20">
                      🌍 Sẵn sàng Remote
                    </span>
                  )}
                  <span className="px-3 py-1 text-sm rounded-full bg-violet-500/20 text-violet-400">
                    {user?.role === 'CANDIDATE' ? '👤 Ứng viên' : user?.role === 'EMPLOYER' ? '🏢 Nhà tuyển dụng' : '⚙️ Admin'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {editing && (
            <div className="p-6 mb-6 glass-card rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Chỉnh sửa thông tin</h2>
                <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Họ và tên</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full input-field"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full input-field"
                    placeholder="0912345678"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Vị trí hiện tại</label>
                  <input
                    type="text"
                    name="currentPosition"
                    value={formData.currentPosition}
                    onChange={handleChange}
                    className="w-full input-field"
                    placeholder="Senior Developer"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Thành phố</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full input-field"
                    placeholder="TP. Hồ Chí Minh"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Số năm kinh nghiệm</label>
                  <input
                    type="number"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    className="w-full input-field"
                    min="0"
                  />
                </div>
                <div className="flex items-center gap-6 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="openToWork"
                      checked={formData.openToWork}
                      onChange={handleChange}
                      className="w-5 h-5 bg-gray-800 border-gray-700 rounded text-violet-500"
                    />
                    <span className="text-gray-300">Đang tìm việc</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="openToRemote"
                      checked={formData.openToRemote}
                      onChange={handleChange}
                      className="w-5 h-5 bg-gray-800 border-gray-700 rounded text-violet-500"
                    />
                    <span className="text-gray-300">Sẵn sàng Remote</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1.5">Giới thiệu bản thân</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full h-24 resize-none input-field"
                    placeholder="Viết vài dòng về bản thân..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">LinkedIn</label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    className="w-full input-field"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">GitHub</label>
                  <input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    className="w-full input-field"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bio Section */}
          {!editing && formData.bio && (
            <div className="p-6 mb-6 glass-card rounded-2xl">
              <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold text-white">
                <User className="w-5 h-5 text-violet-400" /> Giới thiệu
              </h2>
              <p className="leading-relaxed text-gray-300">{formData.bio}</p>
            </div>
          )}

          {/* Social Links */}
          {!editing && (formData.linkedinUrl || formData.githubUrl || formData.portfolioUrl) && (
            <div className="p-6 mb-6 glass-card rounded-2xl">
              <h2 className="mb-4 text-xl font-semibold text-white">Liên kết</h2>
              <div className="flex flex-wrap gap-4">
                {formData.linkedinUrl && (
                  <a
                    href={formData.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-blue-400 glass-card rounded-xl hover:text-blue-300"
                  >
                    <Linkedin className="w-5 h-5" /> LinkedIn
                  </a>
                )}
                {formData.githubUrl && (
                  <a
                    href={formData.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-gray-300 glass-card rounded-xl hover:text-white"
                  >
                    <Github className="w-5 h-5" /> GitHub
                  </a>
                )}
                {formData.portfolioUrl && (
                  <a
                    href={formData.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 glass-card rounded-xl text-violet-400 hover:text-violet-300"
                  >
                    <Globe className="w-5 h-5" /> Portfolio
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="p-4 text-center glass-card rounded-xl">
              <Briefcase className="w-8 h-8 mx-auto mb-2 text-violet-400" />
              <p className="text-2xl font-bold text-white">{formData.experienceYears}</p>
              <p className="text-xs text-gray-400">Năm kinh nghiệm</p>
            </div>
            <div className="p-4 text-center glass-card rounded-xl">
              <Award className="w-8 h-8 mx-auto mb-2 text-violet-400" />
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-xs text-gray-400">Kỹ năng</p>
            </div>
            <div className="p-4 text-center glass-card rounded-xl">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-violet-400" />
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-xs text-gray-400">Đã ứng tuyển</p>
            </div>
            <div className="p-4 text-center glass-card rounded-xl">
              <Briefcase className="w-8 h-8 mx-auto mb-2 text-violet-400" />
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-xs text-gray-400">Việc đã lưu</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
