// src/pages/AuthPages.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rocket, User, Building2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// ==================== LOGIN PAGE ====================
export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        // Hiển thị thông báo lỗi rõ ràng
        if (result.error?.toLowerCase().includes('credentials') ||
            result.error?.toLowerCase().includes('password') ||
            result.error?.toLowerCase().includes('invalid') ||
            result.error?.toLowerCase().includes('401') ||
            result.error?.toLowerCase().includes('unauthorized')) {
          setError('Email hoặc mật khẩu không đúng');
        } else if (result.error?.toLowerCase().includes('not found') ||
                   result.error?.toLowerCase().includes('user')) {
          setError('Tài khoản không tồn tại');
        } else {
          setError(result.error || 'Email hoặc mật khẩu không đúng');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute rounded-full -top-40 -right-40 w-80 h-80 bg-purple-500/20 blur-3xl" />
        <div className="absolute rounded-full -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl">
            <Rocket className="text-white w-7 h-7" />
          </div>
          <span className="text-2xl font-bold gradient-text">JobVerse</span>
        </Link>

        <div className="p-8 glass-card rounded-2xl">
          <h1 className="mb-6 text-2xl font-bold text-center text-white">Đăng Nhập</h1>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/50">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10 input-field"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 bg-gray-800 border-gray-700 rounded text-violet-500" />
                <span className="text-gray-400">Ghi nhớ đăng nhập</span>
              </label>
              <Link to="/forgot-password" className="text-violet-400 hover:text-violet-300">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 btn-primary disabled:opacity-50"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// ==================== REGISTER PAGE ====================
export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CANDIDATE'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (formData.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const result = await register({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: formData.role
    });
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute rounded-full -top-40 -right-40 w-80 h-80 bg-purple-500/20 blur-3xl" />
        <div className="absolute rounded-full -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl">
            <Rocket className="text-white w-7 h-7" />
          </div>
          <span className="text-2xl font-bold gradient-text">JobVerse</span>
        </Link>

        <div className="p-8 glass-card rounded-2xl">
          <h1 className="mb-6 text-2xl font-bold text-center text-white">Đăng Ký</h1>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setFormData({...formData, role: 'CANDIDATE'})}
              className={`p-4 rounded-xl border-2 transition-all ${
                formData.role === 'CANDIDATE' 
                  ? 'border-violet-500 bg-violet-500/10' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <User className={`w-6 h-6 mx-auto mb-1 ${formData.role === 'CANDIDATE' ? 'text-violet-400' : 'text-gray-400'}`} />
              <span className={`block text-sm ${formData.role === 'CANDIDATE' ? 'text-white' : 'text-gray-400'}`}>Ứng viên</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, role: 'EMPLOYER'})}
              className={`p-4 rounded-xl border-2 transition-all ${
                formData.role === 'EMPLOYER' 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <Building2 className={`w-6 h-6 mx-auto mb-1 ${formData.role === 'EMPLOYER' ? 'text-blue-400' : 'text-gray-400'}`} />
              <span className={`block text-sm ${formData.role === 'EMPLOYER' ? 'text-white' : 'text-gray-400'}`}>Nhà tuyển dụng</span>
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/50">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Họ và tên</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className="w-full input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Tối thiểu 8 ký tự"
                  className="w-full pr-10 input-field"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Xác nhận mật khẩu</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                className="w-full input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 btn-primary disabled:opacity-50"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default { LoginPage, RegisterPage };
