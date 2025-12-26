// src/pages/CreateJobPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Footer, LoadingSpinner } from '../components';
import { jobsAPI, companiesAPI, categoriesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateJobPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    companyId: '',
    categoryId: '',
    jobType: 'FULL_TIME',
    experienceLevel: 'MIDDLE',
    salaryMin: '',
    salaryMax: '',
    salaryNegotiable: false,
    currency: 'VND',
    location: '',
    isRemote: false,
    remoteType: 'NO_REMOTE',
    positionsCount: 1,
    deadline: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'EMPLOYER' && user?.role !== 'ADMIN') {
      toast.error('Chỉ nhà tuyển dụng mới có thể đăng tin');
      navigate('/');
      return;
    }

    fetchData();
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    try {
      const [companiesRes, categoriesRes] = await Promise.all([
        companiesAPI.getCompanies().catch(() => ({ data: { content: [] } })),
        categoriesAPI.getCategories().catch(() => ({ data: [] })),
      ]);

      const companiesData = companiesRes.data?.content || companiesRes.data || [];
      const categoriesData = categoriesRes.data || [];

      setCompanies(Array.isArray(companiesData) ? companiesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!formData.title || formData.title.length < 5) {
        toast.error('Tiêu đề phải có ít nhất 5 ký tự');
        setLoading(false);
        return;
      }

      if (!formData.description || formData.description.length < 100) {
        toast.error('Mô tả công việc phải có ít nhất 100 ký tự');
        setLoading(false);
        return;
      }

      if (!formData.companyId) {
        toast.error('Vui lòng chọn công ty');
        setLoading(false);
        return;
      }

      // Prepare data
      const jobData = {
        ...formData,
        companyId: parseInt(formData.companyId),
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) * 1000000 : null,
        salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) * 1000000 : null,
        positionsCount: parseInt(formData.positionsCount) || 1,
        deadline: formData.deadline || null,
      };

      await jobsAPI.createJob(jobData);
      toast.success('Đăng tin tuyển dụng thành công! 🎉');
      navigate('/employer/dashboard');
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi đăng tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-100">
      <Navbar />

      <main className="px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Đăng tin tuyển dụng</h1>
              <p className="text-gray-400 mt-1">Điền thông tin chi tiết về vị trí tuyển dụng</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Thông tin cơ bản</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Tiêu đề công việc <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full input-field"
                    placeholder="VD: Senior Full-stack Developer"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">
                      Công ty <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="companyId"
                      value={formData.companyId}
                      onChange={handleChange}
                      className="w-full input-field"
                      required
                    >
                      <option value="">Chọn công ty</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Danh mục</label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      className="w-full input-field"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Mô tả công việc <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full input-field h-32 resize-none"
                    placeholder="Mô tả chi tiết về công việc (tối thiểu 100 ký tự)"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/100 ký tự tối thiểu
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Yêu cầu</label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    className="w-full input-field h-24 resize-none"
                    placeholder="Yêu cầu về kỹ năng, kinh nghiệm..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Trách nhiệm</label>
                  <textarea
                    name="responsibilities"
                    value={formData.responsibilities}
                    onChange={handleChange}
                    className="w-full input-field h-24 resize-none"
                    placeholder="Trách nhiệm công việc..."
                  />
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Chi tiết công việc</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Loại hình <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    className="w-full input-field"
                    required
                  >
                    <option value="FULL_TIME">Full-time</option>
                    <option value="PART_TIME">Part-time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Cấp bậc <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    className="w-full input-field"
                    required
                  >
                    <option value="INTERN">Intern</option>
                    <option value="FRESHER">Fresher</option>
                    <option value="JUNIOR">Junior</option>
                    <option value="MIDDLE">Middle</option>
                    <option value="SENIOR">Senior</option>
                    <option value="LEAD">Lead</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Địa điểm <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full input-field"
                    placeholder="VD: TP. Hồ Chí Minh"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Số lượng</label>
                  <input
                    type="number"
                    name="positionsCount"
                    value={formData.positionsCount}
                    onChange={handleChange}
                    className="w-full input-field"
                    min="1"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isRemote"
                      checked={formData.isRemote}
                      onChange={handleChange}
                      className="w-5 h-5 bg-gray-800 border-gray-700 rounded text-violet-500"
                    />
                    <span className="text-gray-300">Hỗ trợ làm việc từ xa</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Lương tối thiểu (triệu VNĐ)</label>
                  <input
                    type="number"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleChange}
                    className="w-full input-field"
                    placeholder="10"
                    step="0.5"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Lương tối đa (triệu VNĐ)</label>
                  <input
                    type="number"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleChange}
                    className="w-full input-field"
                    placeholder="20"
                    step="0.5"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="salaryNegotiable"
                      checked={formData.salaryNegotiable}
                      onChange={handleChange}
                      className="w-5 h-5 bg-gray-800 border-gray-700 rounded text-violet-500"
                    />
                    <span className="text-gray-300">Lương thỏa thuận</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Hạn nộp hồ sơ</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full input-field"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang đăng...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Đăng tin
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateJobPage;
