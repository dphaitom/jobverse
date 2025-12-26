// src/App.jsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProtectedRoute } from './components';

// Pages
import HomePage from './pages/HomePage';
import JobListPage from './pages/JobListPage';
import JobDetailPage from './pages/JobDetailPage';
import CompanyListPage from './pages/CompanyListPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import ProfilePage from './pages/ProfilePage';
import SavedJobsPage from './pages/SavedJobsPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import SettingsPage from './pages/SettingsPage';
import ResumeAnalysisPage from './pages/ResumeAnalysisPage';
import InterviewPrepPage from './pages/InterviewPrepPage';
import AdminDashboard from './pages/AdminDashboard';
import CompanyReviewsPage from './pages/CompanyReviewsPage';
import EmployerDashboard from './pages/EmployerDashboard';
import CreateJobPage from './pages/CreateJobPage';
import JobApplicantsPage from './pages/JobApplicantsPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';

// CSS
import './index.css';

// Animated Routes Component
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobListPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/companies" element={<CompanyListPage />} />
          <Route path="/companies/:id" element={<CompanyDetailPage />} />
          <Route path="/companies/:companyId/reviews" element={<CompanyReviewsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* AI Features - Public access */}
          <Route path="/resume-analysis" element={<ResumeAnalysisPage />} />
          <Route path="/interview-prep" element={<InterviewPrepPage />} />
          
          {/* Protected Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/saved-jobs" element={
            <ProtectedRoute>
              <SavedJobsPage />
            </ProtectedRoute>
          } />
          <Route path="/my-applications" element={
            <ProtectedRoute>
              <MyApplicationsPage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Employer Routes */}
          <Route path="/employer/dashboard" element={
            <ProtectedRoute>
              <EmployerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/employer/jobs/new" element={
            <ProtectedRoute>
              <CreateJobPage />
            </ProtectedRoute>
          } />
          <Route path="/employer/jobs/:jobId/applicants" element={
            <ProtectedRoute>
              <JobApplicantsPage />
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a1a1b',
                color: '#fff',
                border: '1px solid #333',
              },
              success: {
                iconTheme: {
                  primary: '#8b5cf6',
                  secondary: '#fff',
                },
              },
            }}
          />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Simple placeholder pages
const NotFoundPage = () => (
  <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-center px-4">
    <div>
      <h1 className="mb-4 text-6xl font-bold text-white">404</h1>
      <p className="mb-8 text-xl text-gray-400">Trang không tồn tại</p>
      <a href="/" className="inline-block btn-primary">Về trang chủ</a>
    </div>
  </div>
);

const PlaceholderPage = ({ title, icon }) => {
  const { Navbar, Footer } = require('./components');
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-100">
      <Navbar />
      <main className="px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-4 text-6xl">{icon}</div>
          <h1 className="mb-4 text-3xl font-bold text-white">{title}</h1>
          <p className="mb-8 text-gray-400">Tính năng này đang được phát triển</p>
          <a href="/" className="inline-block btn-primary">Về trang chủ</a>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
