import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from './auth/UserMenu';

const Header = () => {
  const { isAuthenticated } = useAuth();

  return (
    <header className="...">
      {/* ... logo và navigation ... */}
      
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <UserMenu />
        ) : (
          <>
            <Link 
              to="/login"
              className="text-gray-300 transition-colors hover:text-white"
            >
              Đăng nhập
            </Link>
            <Link 
              to="/register"
              className="px-4 py-2 text-white transition-colors bg-purple-500 rounded-lg hover:bg-purple-600"
            >
              Đăng ký
            </Link>
          </>
        )}
      </div>
    </header>
  );
};