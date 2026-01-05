// src/pages/InterviewPrepPage.jsx
import { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Code, Users, Briefcase, Award,
  ChevronDown, ChevronUp, Send, Lightbulb, Target,
  CheckCircle2, BookOpen
} from 'lucide-react';
import { Navbar, Footer } from '../components';
import AnimatedBackground from '../components/AnimatedBackground';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { aiAPI } from '../services/api';
import toast from 'react-hot-toast';

// Move QuestionCard outside to prevent re-creation on each render
const QuestionCard = memo(({
  question,
  category,
  index,
  expandedQuestion,
  toggleQuestion,
  userAnswers,
  setUserAnswers,
  evaluations,
  evaluating,
  handleEvaluate,
  isDark
}) => {
  const questionKey = `${category}-${index}`;
  const isExpanded = expandedQuestion === questionKey;
  const evaluation = evaluations[questionKey];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'hard': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'hr': return <Users className="w-4 h-4" />;
      case 'technical': return <Code className="w-4 h-4" />;
      case 'coding': return <Code className="w-4 h-4" />;
      case 'behavioral': return <MessageSquare className="w-4 h-4" />;
      case 'system design': return <Briefcase className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className={`${isDark ? 'bg-nike-black-light border-gray-800' : 'bg-white border-gray-200 shadow-sm'} border rounded-xl overflow-hidden hover:border-ai-purple/30 transition-all duration-300`}>
      <button
        onClick={() => toggleQuestion(category, index)}
        className={`w-full px-6 py-4 flex items-start justify-between text-left ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty}
            </span>
            <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {getTypeIcon(question.type)}
              {question.type}
            </span>
          </div>
          <p className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium pr-4`}>{question.question}</p>
        </div>
        {isExpanded ? (
          <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`} />
        ) : (
          <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`} />
        )}
      </button>

      {isExpanded && (
        <div className={`px-6 pb-6 space-y-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          {/* Tips */}
          {question.tips && (
            <div className="pt-4">
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 flex items-center gap-2`}>
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                Tips:
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{question.tips}</p>
            </div>
          )}

          {/* Your Answer */}
          <div>
            <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 flex items-center gap-2`}>
              <MessageSquare className="w-4 h-4 text-ai-purple" />
              Câu trả lời của bạn:
            </h4>
            <textarea
              value={userAnswers[questionKey] || ''}
              onChange={(e) => {
                const newValue = e.target.value;
                setUserAnswers(prev => ({ ...prev, [questionKey]: newValue }));
              }}
              placeholder="Nhập câu trả lời của bạn..."
              className={`w-full px-4 py-3 border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ai-purple/50 focus:border-ai-purple/50 transition-all resize-none ${
                isDark 
                  ? 'bg-nike-black border-gray-700 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
              rows={4}
            />
            <button
              onClick={() => handleEvaluate(question, category, index)}
              disabled={evaluating[questionKey]}
              className="mt-3 px-4 py-2 bg-gradient-to-r from-ai-purple to-ai-blue hover:from-ai-purple/90 hover:to-ai-blue/90 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2"
            >
              {evaluating[questionKey] ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang đánh giá...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Đánh Giá
                </>
              )}
            </button>
          </div>

          {/* Evaluation */}
          {evaluation && (
            <div className={`${isDark ? 'bg-gradient-to-br from-ai-purple/10 to-ai-blue/10 border-ai-purple/20' : 'bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200'} border rounded-lg p-4`}>
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-3 flex items-center gap-2`}>
                <Award className="w-4 h-4 text-ai-purple" />
                Đánh giá của AI:
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Score: </span>
                  <span className="text-ai-purple font-bold">{evaluation.score}/100</span>
                </div>
                <div>
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Feedback: </span>
                  <p className={`${isDark ? 'text-white' : 'text-gray-900'} mt-1`}>{evaluation.feedback}</p>
                </div>
                {evaluation.suggestions && evaluation.suggestions.length > 0 && (
                  <div>
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} block mb-2`}>Suggestions:</span>
                    <ul className="space-y-1">
                      {evaluation.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-ai-purple flex-shrink-0 mt-0.5" />
                          <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sample Answer */}
          {question.sampleAnswer && (
            <div className={`${isDark ? 'bg-nike-black border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 flex items-center gap-2`}>
                <BookOpen className="w-4 h-4 text-green-500" />
                Câu trả lời mẫu:
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} whitespace-pre-line`}>{question.sampleAnswer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

QuestionCard.displayName = 'QuestionCard';

// Move QuestionSection outside as well
const QuestionSection = memo(({
  title,
  questions,
  category,
  icon: Icon,
  color,
  expandedQuestion,
  toggleQuestion,
  userAnswers,
  setUserAnswers,
  evaluations,
  evaluating,
  handleEvaluate,
  isDark
}) => {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 ${color} rounded-lg`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title} ({questions.length})
        </h3>
      </div>
      <div className="space-y-3">
        {questions.map((question, index) => (
          <QuestionCard
            key={`${category}-${index}`}
            question={question}
            category={category}
            index={index}
            expandedQuestion={expandedQuestion}
            toggleQuestion={toggleQuestion}
            userAnswers={userAnswers}
            setUserAnswers={setUserAnswers}
            evaluations={evaluations}
            evaluating={evaluating}
            handleEvaluate={handleEvaluate}
            isDark={isDark}
          />
        ))}
      </div>
    </div>
  );
});

QuestionSection.displayName = 'QuestionSection';

const InterviewPrepPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const [role, setRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('JUNIOR');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [evaluating, setEvaluating] = useState({});

  const roles = [
    'Frontend Developer',
    'Backend Developer',
    'Full-Stack Developer',
    'Mobile Developer',
    'DevOps Engineer',
    'Data Engineer',
    'AI/ML Engineer',
    'QA Engineer',
    'UI/UX Designer',
    'Product Manager'
  ];

  const levels = [
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'JUNIOR', label: 'Junior (0-2 years)' },
    { value: 'MID', label: 'Mid-Level (2-5 years)' },
    { value: 'SENIOR', label: 'Senior (5+ years)' }
  ];

  const handleGenerate = async () => {
    if (!role.trim()) {
      toast.error('Vui lòng chọn hoặc nhập role');
      return;
    }

    setLoading(true);
    try {
      // Use guest endpoint if not authenticated
      const response = isAuthenticated
        ? await aiAPI.generateInterviewQuestions({ role, experienceLevel, skills: [] })
        : await aiAPI.generateInterviewQuestionsGuest({ role, experienceLevel, skills: [] });
      setQuestions(response.data);
      setUserAnswers({});
      setEvaluations({});
      toast.success('Đã tạo câu hỏi phỏng vấn!');
    } catch (error) {
      console.error('Error generating questions:', error);
      const errorMessage = error.response?.data?.error?.message 
        || error.response?.data?.message 
        || error.message 
        || 'Có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async (question, category, index) => {
    const questionKey = `${category}-${index}`;
    const answer = userAnswers[questionKey];

    if (!answer || !answer.trim()) {
      toast.error('Vui lòng nhập câu trả lời');
      return;
    }

    setEvaluating(prev => ({ ...prev, [questionKey]: true }));
    try {
      const response = await aiAPI.evaluateAnswer({
        question: question.question,
        userAnswer: answer
      });
      setEvaluations(prev => ({ ...prev, [questionKey]: response.data }));
      toast.success('Đã đánh giá câu trả lời!');
    } catch (error) {
      console.error('Error evaluating answer:', error);
      toast.error(error.response?.data?.error?.message || 'Có lỗi xảy ra');
    } finally {
      setEvaluating(prev => ({ ...prev, [questionKey]: false }));
    }
  };

  const toggleQuestion = useCallback((category, index) => {
    const key = `${category}-${index}`;
    setExpandedQuestion(prev => prev === key ? null : key);
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0b]' : 'bg-slate-50'} transition-colors duration-500`}>
      <AnimatedBackground />
      <Navbar />

      {/* Hero Section */}
      <section className={`relative py-20 ${isDark ? 'bg-gradient-to-br from-[#0a0a0b] via-[#111] to-[#0a0a0b]' : 'bg-gradient-to-br from-slate-50 via-white to-slate-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up pt-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full mb-6">
              <Target className="w-4 h-4 text-violet-500" />
              <span className="text-sm text-violet-500 font-medium">AI Interview Practice</span>
            </div>
            <h1 className={`text-4xl md:text-5xl font-black mb-6 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Luyện Tập
              <span className="block text-violet-500">Phỏng Vấn</span>
            </h1>
            <p className={`text-xl max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Chuẩn bị cho cuộc phỏng vấn với 100+ câu hỏi chuyên sâu và đánh giá bằng AI. Tự tin hơn trong mỗi buổi phỏng vấn.
            </p>
          </div>
        </div>
      </section>

      {/* Setup Section */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`${isDark ? 'bg-[#111] border-gray-800' : 'bg-white border-gray-200 shadow-sm'} border rounded-2xl p-8 mb-8`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Thiết Lập Phỏng Vấn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role Selection */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Role / Position
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all ${
                    isDark 
                      ? 'bg-[#0a0a0b] border-gray-700 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">-- Chọn role --</option>
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all ${
                    isDark 
                      ? 'bg-[#0a0a0b] border-gray-700 text-white' 
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                >
                  {levels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !role}
              className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 disabled:from-gray-500 disabled:to-gray-500 text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang tạo câu hỏi...
                </>
              ) : (
                <>
                  <MessageSquare className="w-5 h-5" />
                  Tạo Câu Hỏi Phỏng Vấn
                </>
              )}
            </button>
          </div>

          {/* Questions Display */}
          {questions && (
            <div className="space-y-8">
              <QuestionSection
                title="HR Questions"
                questions={questions.hrQuestions}
                category="hr"
                icon={Users}
                color="bg-blue-500/10 text-blue-500"
                expandedQuestion={expandedQuestion}
                toggleQuestion={toggleQuestion}
                userAnswers={userAnswers}
                setUserAnswers={setUserAnswers}
                evaluations={evaluations}
                evaluating={evaluating}
                handleEvaluate={handleEvaluate}
                isDark={isDark}
              />

              <QuestionSection
                title="Technical Questions"
                questions={questions.technicalQuestions}
                category="technical"
                icon={Code}
                color="bg-purple-500/10 text-purple-500"
                expandedQuestion={expandedQuestion}
                toggleQuestion={toggleQuestion}
                userAnswers={userAnswers}
                setUserAnswers={setUserAnswers}
                evaluations={evaluations}
                evaluating={evaluating}
                handleEvaluate={handleEvaluate}
                isDark={isDark}
              />

              <QuestionSection
                title="Coding Challenges"
                questions={questions.codingChallenges}
                category="coding"
                icon={Code}
                color="bg-green-500/10 text-green-500"
                expandedQuestion={expandedQuestion}
                toggleQuestion={toggleQuestion}
                userAnswers={userAnswers}
                setUserAnswers={setUserAnswers}
                evaluations={evaluations}
                evaluating={evaluating}
                handleEvaluate={handleEvaluate}
                isDark={isDark}
              />

              <QuestionSection
                title="Behavioral Questions"
                questions={questions.behavioralQuestions}
                category="behavioral"
                icon={MessageSquare}
                color="bg-yellow-500/10 text-yellow-500"
                expandedQuestion={expandedQuestion}
                toggleQuestion={toggleQuestion}
                userAnswers={userAnswers}
                setUserAnswers={setUserAnswers}
                evaluations={evaluations}
                evaluating={evaluating}
                handleEvaluate={handleEvaluate}
                isDark={isDark}
              />

              <QuestionSection
                title="System Design"
                questions={questions.systemDesignQuestions}
                category="system-design"
                icon={Briefcase}
                color="bg-red-500/10 text-red-500"
                expandedQuestion={expandedQuestion}
                toggleQuestion={toggleQuestion}
                userAnswers={userAnswers}
                setUserAnswers={setUserAnswers}
                evaluations={evaluations}
                evaluating={evaluating}
                handleEvaluate={handleEvaluate}
                isDark={isDark}
              />
            </div>
          )}

          {!questions && (
            <div className={`${isDark ? 'bg-nike-black-light border-gray-800' : 'bg-white border-gray-200 shadow-sm'} border rounded-2xl p-12 text-center`}>
              <div className="w-20 h-20 mx-auto mb-6 bg-ai-purple/10 rounded-full flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-ai-purple" />
              </div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
                Chưa có câu hỏi
              </h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Chọn role và level, sau đó nhấn "Tạo Câu Hỏi Phỏng Vấn"
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default InterviewPrepPage;
