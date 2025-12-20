// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kiểm tra token và load user khi app khởi động
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // Thử lấy thông tin user
          const response = await userAPI.getCurrentUser();
          if (response.success) {
            setUser(response.data);
          }
        } catch (err) {
          console.error('Failed to load user:', err);
          // Token hết hạn hoặc không hợp lệ
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Đăng ký
  const register = useCallback(async (data) => {
    setError(null);
    try {
      const response = await authAPI.register(data);

      if (response.success) {
        // Lưu tokens
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);

        // Set user info
        setUser(response.data.user);

        toast.success(`Chào mừng ${response.data.user.fullName}! Đăng ký thành công 🎉`);
        return { success: true };
      }

      toast.error(response.message || 'Đăng ký thất bại');
      return { success: false, error: response.message };
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Có lỗi xảy ra khi đăng ký');
      return { success: false, error: err.message };
    }
  }, []);

  // Đăng nhập
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await authAPI.login(email, password);

      if (response.success) {
        // Lưu tokens
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);

        // Set user info
        setUser(response.data.user);

        toast.success(`Xin chào ${response.data.user.fullName}! Đăng nhập thành công 👋`);
        return { success: true };
      }

      toast.error(response.message || 'Đăng nhập thất bại');
      return { success: false, error: response.message };
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Sai email hoặc mật khẩu');
      return { success: false, error: err.message };
    }
  }, []);

  // Đăng xuất
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Xóa tokens và user
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      toast.success('Đã đăng xuất thành công. Hẹn gặp lại! 👋');
    }
  }, []);

  // Refresh token
  const refreshAccessToken = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await authAPI.refreshToken(refreshToken);
      
      if (response.success) {
        localStorage.setItem('accessToken', response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Refresh token error:', err);
      logout();
      return false;
    }
  }, [logout]);

  // Cập nhật user info
  const updateUser = useCallback((userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    refreshAccessToken,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
