// src/pages/ResumeAnalysisPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, Star, TrendingUp, CheckCircle2,
  AlertCircle, Lightbulb, Award, BarChart3, Target
} from 'lucide-react';
import { Navbar, Footer } from '../components';
import AnimatedBackground from '../components/AnimatedBackground';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { aiAPI } from '../services/api';
import toast from 'react-hot-toast';

const ResumeAnalysisPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast.error('Vui lòng nhập nội dung CV');
      return;
    }

    setAnalyzing(true);
    try {
      // Use guest endpoint if not authenticated, otherwise use authenticated endpoint
      const response = isAuthenticated 
        ? await aiAPI.analyzeResume({ resumeText })
        : await aiAPI.analyzeResumeGuest({ resumeText });
      setResult(response.data);
      toast.success('Phân tích CV thành công!');
    } catch (error) {
      console.error('Error analyzing resume:', error);
      const errorMessage = error.response?.data?.error?.message 
        || error.response?.data?.message 
        || error.message 
        || 'Có lỗi xảy ra khi phân tích CV';
      toast.error(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setResumeText(event.target.result);
        toast.success('Đã tải file thành công!');
      };
      reader.readAsText(file);
    } else {
      toast.error('Vui lòng chọn file .txt');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Xuất sắc';
    if (score >= 60) return 'Tốt';
    if (score >= 40) return 'Trung bình';
    return 'Cần cải thiện';
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0b]' : 'bg-slate-50'} transition-colors duration-500`}>
      <AnimatedBackground />
      <Navbar />

      {/* Hero Section */}
      <section className={`relative py-20 ${isDark ? 'bg-gradient-to-br from-[#0a0a0b] via-[#111] to-[#0a0a0b]' : 'bg-gradient-to-br from-slate-50 via-white to-slate-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up pt-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full mb-6">
              <Lightbulb className="w-4 h-4 text-violet-500" />
              <span className="text-sm text-violet-500 font-medium">AI-Powered Analysis</span>
            </div>
            <h1 className={`text-4xl md:text-5xl font-black mb-6 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Phân Tích CV
              <span className="block text-violet-500">Với AI</span>
            </h1>
            <p className={`text-xl max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Nhận đánh giá chi tiết về CV của bạn với AI. Tìm hiểu điểm mạnh, điểm yếu và cách cải thiện để tăng cơ hội được tuyển dụng.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Input Section */}
            <div className="space-y-6">
              <div className={`${isDark ? 'bg-[#111] border-gray-800' : 'bg-white border-gray-200 shadow-sm'} border rounded-2xl p-8`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <FileText className="w-6 h-6 text-violet-500" />
                    Nội Dung CV
                  </h2>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-all duration-300">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-medium">Upload .txt</span>
                    </div>
                  </label>
                </div>

                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste nội dung CV của bạn vào đây... (hoặc upload file .txt)&#10;&#10;Ví dụ:&#10;Nguyễn Văn A&#10;Software Engineer&#10;Email: example@gmail.com&#10;Phone: 0123456789&#10;&#10;Skills: React, Node.js, AWS, Docker&#10;&#10;Experience:&#10;- Frontend Developer tại ABC Company (2020-2023)&#10;  + Phát triển web app với React&#10;  + Tăng performance 40%&#10;&#10;Education:&#10;Bachelor of Computer Science"
                  className={`w-full h-96 px-4 py-3 border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none font-mono text-sm ${
                    isDark 
                      ? 'bg-[#0a0a0b] border-gray-700 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />

                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || !resumeText.trim()}
                  className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 disabled:from-gray-500 disabled:to-gray-500 text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                  {analyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang phân tích...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-5 h-5" />
                      Phân Tích CV
                    </>
                  )}
                </button>
              </div>

              {/* Tips Section */}
              <div className={`${isDark ? 'bg-[#111] border-gray-800' : 'bg-white border-gray-200 shadow-sm'} border rounded-2xl p-6`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Tips cho CV tốt
                </h3>
                <ul className={`space-y-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Sử dụng keywords từ mô tả công việc</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Định lượng thành tích (ví dụ: "Tăng 30%")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Format rõ ràng, dễ đọc với ATS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Highlight skills quan trọng nhất</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {!result ? (
                <div className={`${isDark ? 'bg-[#111] border-gray-800' : 'bg-white border-gray-200 shadow-sm'} border rounded-2xl p-12 text-center`}>
                  <div className="w-20 h-20 mx-auto mb-6 bg-violet-500/10 rounded-full flex items-center justify-center">
                    <FileText className="w-10 h-10 text-violet-500" />
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Chưa có kết quả
                  </h3>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Nhập nội dung CV và nhấn "Phân Tích CV" để xem kết quả
                  </p>
                </div>
              ) : (
                <>
                  {/* Overall Score */}
                  <div className="bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 rounded-2xl p-8 text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${isDark ? 'bg-white/10' : 'bg-violet-100'}`}>
                      <Award className="w-4 h-4 text-violet-500" />
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-violet-700'}`}>Overall Score</span>
                    </div>
                    <div className={`text-6xl font-black mb-2 ${getScoreColor(result.overallScore)}`}>
                      {result.overallScore}
                      <span className="text-3xl">/100</span>
                    </div>
                    <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {getScoreLabel(result.overallScore)}
                    </p>
                  </div>

                  {/* Detailed Scores */}
                  <div className={`${isDark ? 'bg-[#111] border-gray-800' : 'bg-white border-gray-200 shadow-sm'} border rounded-2xl p-6`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <BarChart3 className="w-5 h-5 text-violet-500" />
                      Điểm Chi Tiết
                    </h3>
                    <div className="space-y-4">
                      {/* ATS Score */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>ATS Score (40%)</span>
                          <span className={`text-lg font-bold ${getScoreColor(result.atsScore)}`}>
                            {result.atsScore}
                          </span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                          <div
                            className={`h-full ${getScoreColor(result.atsScore).replace('text-', 'bg-')}`}
                            style={{ width: `${result.atsScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Content Score */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Content Score (30%)</span>
                          <span className={`text-lg font-bold ${getScoreColor(result.contentScore)}`}>
                            {result.contentScore}
                          </span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                          <div
                            className={`h-full ${getScoreColor(result.contentScore).replace('text-', 'bg-')}`}
                            style={{ width: `${result.contentScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Format Score */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Format Score (30%)</span>
                          <span className={`text-lg font-bold ${getScoreColor(result.formatScore)}`}>
                            {result.formatScore}
                          </span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                          <div
                            className={`h-full ${getScoreColor(result.formatScore).replace('text-', 'bg-')}`}
                            style={{ width: `${result.formatScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Extracted Info */}
                  <div className={`${isDark ? 'bg-[#111] border-gray-800' : 'bg-white border-gray-200 shadow-sm'} border rounded-2xl p-6`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <Target className="w-5 h-5 text-violet-500" />
                      Thông Tin Trích Xuất
                    </h3>
                    <div className="space-y-4">
                      {/* Skills */}
                      {result.skills && (
                        <div>
                          <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Skills {Array.isArray(result.skills) ? `(${result.skills.length})` : ''}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(result.skills) ? (
                              result.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-500 rounded-full text-sm"
                                >
                                  {typeof skill === 'string' ? skill : skill.name || JSON.stringify(skill)}
                                </span>
                              ))
                            ) : typeof result.skills === 'string' ? (
                              <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-500 rounded-full text-sm">
                                {result.skills}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      )}

                      {/* Experience */}
                      {result.experience !== undefined && (
                        <div>
                          <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Experience</p>
                          <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{result.experience} năm</p>
                        </div>
                      )}

                      {/* Education */}
                      {result.education && (
                        <div>
                          <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Education</p>
                          <div className="space-y-1">
                            {Array.isArray(result.education) ? (
                              result.education.map((edu, index) => (
                                <p key={index} className={isDark ? 'text-white' : 'text-gray-900'}>
                                  {typeof edu === 'string' ? edu : edu.degree || edu.school || JSON.stringify(edu)}
                                </p>
                              ))
                            ) : typeof result.education === 'string' ? (
                              <p className={isDark ? 'text-white' : 'text-gray-900'}>{result.education}</p>
                            ) : (
                              <p className={isDark ? 'text-white' : 'text-gray-900'}>
                                {result.education.degree || result.education.school || JSON.stringify(result.education)}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Contact */}
                      {result.contactInfo && Object.keys(result.contactInfo).length > 0 && (
                        <div>
                          <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Contact Info</p>
                          <div className="space-y-1 text-sm">
                            {result.contactInfo.email && (
                              <p className={isDark ? 'text-white' : 'text-gray-900'}>Email: {result.contactInfo.email}</p>
                            )}
                            {result.contactInfo.phone && (
                              <p className={isDark ? 'text-white' : 'text-gray-900'}>Phone: {result.contactInfo.phone}</p>
                            )}
                            {result.contactInfo.linkedin && (
                              <p className={isDark ? 'text-white' : 'text-gray-900'}>LinkedIn: {result.contactInfo.linkedin}</p>
                            )}
                            {result.contactInfo.github && (
                              <p className={isDark ? 'text-white' : 'text-gray-900'}>GitHub: {result.contactInfo.github}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recommendations */}
                  {result.recommendations && (Array.isArray(result.recommendations) ? result.recommendations.length > 0 : true) && (
                    <div className={`${isDark ? 'bg-[#111] border-gray-800' : 'bg-white border-gray-200 shadow-sm'} border rounded-2xl p-6`}>
                      <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        Gợi Ý Cải Thiện
                      </h3>
                      <ul className="space-y-3">
                        {Array.isArray(result.recommendations) ? (
                          result.recommendations.map((rec, index) => (
                            <li key={index} className={`flex items-start gap-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span>{typeof rec === 'string' ? rec : rec.text || rec.message || JSON.stringify(rec)}</span>
                            </li>
                          ))
                        ) : (
                          <li className={`flex items-start gap-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span>{typeof result.recommendations === 'string' ? result.recommendations : JSON.stringify(result.recommendations)}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Insights */}
                  {result.insights && (Array.isArray(result.insights) ? result.insights.length > 0 : true) && (
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-2xl p-6">
                      <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <Star className="w-5 h-5 text-green-500" />
                        Career Insights
                      </h3>
                      <ul className="space-y-3">
                        {Array.isArray(result.insights) ? result.insights.map((insight, index) => (
                          <li key={index} className={`flex items-start gap-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <TrendingUp className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{typeof insight === 'string' ? insight : insight.text || insight.message || JSON.stringify(insight)}</span>
                          </li>
                        )) : (
                          <li className={`flex items-start gap-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <TrendingUp className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{typeof result.insights === 'string' ? result.insights : JSON.stringify(result.insights)}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ResumeAnalysisPage;
