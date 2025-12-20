// src/pages/SavedJobsPage.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  Heart, X, MapPin, DollarSign, Briefcase, List, Layers, Undo2
} from 'lucide-react';
import { Navbar, Footer, LoadingSpinner, JobCard } from '../components';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { swipeVariants } from '../utils/animations';
import toast from 'react-hot-toast';

const SavedJobsPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('list');
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeHistory, setSwipeHistory] = useState([]);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const response = await authAPI.get('/v1/saved-jobs');
      setSavedJobs(response.data?.content || response.data || []);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId) => {
    try {
      await authAPI.delete(`/v1/saved-jobs/${jobId}`);
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      toast.success('Đã bỏ lưu việc làm');
    } catch (error) {
      console.error('Error unsaving job:', error);
    }
  };

  const handleSwipe = (direction, jobId) => {
    setSwipeHistory(prev => [...prev, { index: currentIndex, job: savedJobs[currentIndex] }]);

    if (direction === 'left') {
      handleUnsave(jobId);
    } else if (direction === 'right') {
      navigate(`/jobs/${jobId}`);
    }

    if (currentIndex < savedJobs.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleUndo = () => {
    if (swipeHistory.length === 0) return;
    const lastAction = swipeHistory[swipeHistory.length - 1];
    setSwipeHistory(prev => prev.slice(0, -1));
    if (!savedJobs.find(j => j.id === lastAction.job.id)) {
      setSavedJobs(prev => [...prev, lastAction.job]);
    }
    setCurrentIndex(lastAction.index);
    toast.success('Đã hoàn tác');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-gray-100">
        <Navbar />
        <div className="pt-24"><LoadingSpinner size="lg" /></div>
      </div>
    );
  }

  const currentJob = savedJobs[currentIndex];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-100">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Việc làm đã lưu</h1>
              <p className="text-gray-400">{savedJobs.length} việc làm trong danh sách</p>
            </div>
            <div className="flex gap-2 glass-card rounded-xl p-1">
              <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-violet-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                <List className="w-4 h-4" />Danh sách
              </button>
              <button onClick={() => setViewMode('swipe')} className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${viewMode === 'swipe' ? 'bg-violet-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                <Layers className="w-4 h-4" />Swipe
              </button>
            </div>
          </div>

          {savedJobs.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h2 className="text-xl font-semibold text-white mb-2">Chưa có việc làm nào được lưu</h2>
              <p className="text-gray-400 mb-6">Hãy khám phá và lưu những việc làm bạn quan tâm</p>
              <button onClick={() => navigate('/jobs')} className="btn-primary">Khám phá việc làm</button>
            </div>
          ) : viewMode === 'list' ? (
            <ListView jobs={savedJobs} onUnsave={handleUnsave} />
          ) : (
            <SwipeView currentJob={currentJob} currentIndex={currentIndex} total={savedJobs.length} onSwipe={handleSwipe} onUndo={handleUndo} canUndo={swipeHistory.length > 0} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

const ListView = ({ jobs, onUnsave }) => (
  <div className="grid gap-4">
    {jobs.map((job) => (<JobCard key={job.id} job={job} isSaved={true} onSave={() => onUnsave(job.id)} />))}
  </div>
);

const SwipeView = ({ currentJob, currentIndex, total, onSwipe, onUndo, canUndo }) => {
  const [exitDirection, setExitDirection] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event, info) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      setExitDirection(1);
      setTimeout(() => onSwipe('right', currentJob.id), 100);
    } else if (info.offset.x < -threshold) {
      setExitDirection(-1);
      setTimeout(() => onSwipe('left', currentJob.id), 100);
    }
  };

  if (!currentJob) {
    return (
      <div className="text-center py-16">
        <Heart className="w-16 h-16 mx-auto mb-4 text-violet-500" />
        <h2 className="text-xl font-semibold text-white mb-2">Đã xem hết tất cả!</h2>
        <p className="text-gray-400 mb-6">Bạn đã xem hết {total} việc làm đã lưu</p>
        <button onClick={onUndo} className="btn-primary" disabled={!canUndo}><Undo2 className="w-4 h-4 mr-2" />Hoàn tác</button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-center gap-2 mb-6">
        <span className="text-gray-400">{currentIndex + 1} / {total}</span>
        <div className="w-48 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-all" style={{ width: `${((currentIndex + 1) / total) * 100}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-center gap-8 mb-6 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center"><X className="w-4 h-4 text-red-400" /></div>
          <span>Vuốt trái để bỏ lưu</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"><Heart className="w-4 h-4 text-green-400" /></div>
          <span>Vuốt phải để ứng tuyển</span>
        </div>
      </div>

      <div className="relative h-[600px] flex items-center justify-center">
        <AnimatePresence custom={exitDirection}>
          <motion.div key={currentJob.id} style={{ x, rotate, opacity }} drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={handleDragEnd} custom={exitDirection} variants={swipeVariants} initial="enter" animate="center" exit="exit" className="absolute w-full max-w-2xl cursor-grab active:cursor-grabbing">
            <div className="glass-card rounded-2xl p-8 shadow-2xl">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-4xl flex-shrink-0">
                  {currentJob.company?.logoUrl ? (<img src={currentJob.company.logoUrl} alt={currentJob.company.name} className="w-16 h-16 object-contain" />) : ('🏢')}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">{currentJob.title}</h2>
                  <p className="text-lg text-violet-400 mb-4">{currentJob.company?.name}</p>
                  <div className="flex flex-wrap gap-3 text-gray-400">
                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />{currentJob.location}</span>
                    <span className="flex items-center gap-2"><Briefcase className="w-4 h-4" />{currentJob.jobType?.replace('_', ' ')}</span>
                    <span className="flex items-center gap-2"><DollarSign className="w-4 h-4" />{currentJob.salaryMin && currentJob.salaryMax ? `${(currentJob.salaryMin / 1000000).toFixed(0)}-${(currentJob.salaryMax / 1000000).toFixed(0)} triệu` : 'Thỏa thuận'}</span>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Mô tả công việc</h3>
                <p className="text-gray-300 line-clamp-6">{currentJob.description}</p>
              </div>
              {currentJob.skills && currentJob.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Kỹ năng yêu cầu</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentJob.skills.slice(0, 6).map((skill, idx) => (<span key={idx} className="skill-pill">{skill.name || skill}</span>))}
                    {currentJob.skills.length > 6 && (<span className="skill-pill">+{currentJob.skills.length - 6}</span>)}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-6 mt-8">
        <motion.button onClick={() => handleDragEnd({}, { offset: { x: -200 } })} className="w-16 h-16 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><X className="w-8 h-8 text-red-400" /></motion.button>
        {canUndo && (<motion.button onClick={onUndo} className="w-12 h-12 rounded-full glass-card hover:bg-gray-800/40 flex items-center justify-center transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Undo2 className="w-5 h-5 text-gray-400" /></motion.button>)}
        <motion.button onClick={() => handleDragEnd({}, { offset: { x: 200 } })} className="w-16 h-16 rounded-full bg-green-500/20 hover:bg-green-500/30 flex items-center justify-center transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><Heart className="w-8 h-8 text-green-400" /></motion.button>
      </div>
    </div>
  );
};

export default SavedJobsPage;
