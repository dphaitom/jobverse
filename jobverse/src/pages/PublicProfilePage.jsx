// src/pages/PublicProfilePage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User, Mail, MapPin, Briefcase, Calendar, Github, Linkedin, Globe, 
  Award, Star, ArrowLeft
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Navbar, Footer, LoadingSpinner, EmptyState } from '../components';
import AnimatedBackground from '../components/AnimatedBackground';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const PublicProfilePage = () => {
  const { userId } = useParams();
  const { isDark } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/users/${userId}/public-profile`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Không tìm thấy người dùng');
        } else {
          setError('Không thể tải thông tin người dùng');
        }
        return;
      }
      const data = await response.json();
      setProfile(data.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0b]' : 'bg-slate-50'}`}>
        <Navbar />
        <div className="pt-24">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0b]' : 'bg-slate-50'}`}>
        <Navbar />
        <div className="pt-24 px-4">
          <div className="max-w-2xl mx-auto">
            <EmptyState
              icon={User}
              title={error || 'Không tìm thấy người dùng'}
              description="Người dùng này không tồn tại hoặc hồ sơ không công khai"
              action={
                <Link to="/" className="btn-primary">Về trang chủ</Link>
              }
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0b]' : 'bg-slate-50'} text-gray-100 transition-colors duration-500`}>
      <AnimatedBackground />
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>

          {/* Profile Header */}
          <div className="glass-card rounded-2xl p-8 mb-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-white" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {profile.fullName || 'Người dùng'}
                </h1>
                
                {profile.currentPosition && (
                  <p className={`text-lg mb-3 ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
                    {profile.currentPosition}
                  </p>
                )}

                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-400">
                  {profile.city && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {profile.city}
                    </span>
                  )}
                  {profile.experienceYears > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" />
                      {profile.experienceYears} năm kinh nghiệm
                    </span>
                  )}
                </div>

                {/* Status badges */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                  {profile.openToWork && (
                    <span className="px-3 py-1 text-sm bg-green-500/20 text-green-400 rounded-full">
                      🟢 Đang tìm việc
                    </span>
                  )}
                  {profile.openToRemote && (
                    <span className="px-3 py-1 text-sm bg-blue-500/20 text-blue-400 rounded-full">
                      🌍 Sẵn sàng Remote
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="glass-card rounded-2xl p-6 mb-6">
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Giới thiệu
              </h2>
              <p className={`whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {profile.bio}
              </p>
            </div>
          )}

          {/* Social Links */}
          {(profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl) && (
            <div className="glass-card rounded-2xl p-6 mb-6">
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Liên kết
              </h2>
              <div className="flex flex-wrap gap-4">
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                    LinkedIn
                  </a>
                )}
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600/20 text-gray-300 rounded-lg hover:bg-gray-600/30 transition-colors"
                  >
                    <Github className="w-5 h-5" />
                    GitHub
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600/20 text-violet-400 rounded-lg hover:bg-violet-600/30 transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Kỹ năng
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1.5 bg-violet-500/20 text-violet-300 rounded-lg text-sm"
                  >
                    {skill.name || skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicProfilePage;
