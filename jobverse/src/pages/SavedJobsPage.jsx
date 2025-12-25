// src/pages/SavedJobsPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  BookmarkIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  TrashIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedJobs();
    }
  }, [isAuthenticated]);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await jobsAPI.getSavedJobs();
      console.log('Saved jobs response:', response);

      const jobs = response.data?.content || response.data || response.content || [];
      setSavedJobs(Array.isArray(jobs) ? jobs : []);
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
      setError(err.message || 'Không thể tải danh sách việc làm đã lưu');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveJob = async (jobId) => {
    try {
      await jobsAPI.unsaveJob(jobId);
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (err) {
      console.error('Error unsaving job:', err);
      alert('Không thể bỏ lưu việc làm');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <BookmarkIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Vui lòng đăng nhập
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Bạn cần đăng nhập để xem việc làm đã lưu
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="mb-4 text-red-500">{error}</p>
          <button
            onClick={fetchSavedJobs}
            className="px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <BookmarkSolidIcon className="w-8 h-8 text-primary-600" />
            Việc làm đã lưu
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {savedJobs.length} việc làm đã lưu
          </p>
        </div>

        {savedJobs.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-lg shadow dark:bg-gray-800">
            <BookmarkIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              Chưa có việc làm nào được lưu
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Hãy lưu các việc làm bạn quan tâm để xem lại sau
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
            >
              <BriefcaseIcon className="w-5 h-5 mr-2" />
              Tìm việc làm
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((job) => (
              <div
                key={job.id}
                className="p-6 transition-shadow bg-white rounded-lg shadow dark:bg-gray-800 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600"
                    >
                      {job.title}
                    </Link>

                    <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-400">
                      <BuildingOfficeIcon className="w-4 h-4" />
                      <span>{job.companyName || job.company?.name || 'Công ty'}</span>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                      {job.location && (
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                      )}

                      {(job.salaryMin || job.salaryMax || job.salaryRange) && (
                        <div className="flex items-center gap-1">
                          <CurrencyDollarIcon className="w-4 h-4" />
                          <span>
                            {job.salaryRange ||
                              `${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()} VNĐ`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnsaveJob(job.id)}
                    className="p-2 text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Bỏ lưu"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobsPage;
