// src/components/AnimatedBackground.jsx
// Animated background that works for both Light and Dark themes
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const AnimatedBackground = () => {
  const { isDark } = useTheme();

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Animated gradient blobs */}
      <motion.div
        className={`absolute rounded-full blur-3xl ${
          isDark 
            ? 'bg-violet-500/20' 
            : 'bg-violet-400/10'
        }`}
        style={{ width: '40%', height: '40%' }}
        animate={{
          x: ['-10%', '10%', '-10%'],
          y: ['-10%', '15%', '-10%'],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        initial={{ top: '10%', left: '5%' }}
      />

      <motion.div
        className={`absolute rounded-full blur-3xl ${
          isDark 
            ? 'bg-indigo-500/15' 
            : 'bg-indigo-400/8'
        }`}
        style={{ width: '35%', height: '35%' }}
        animate={{
          x: ['10%', '-15%', '10%'],
          y: ['5%', '-10%', '5%'],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        initial={{ top: '50%', right: '10%' }}
      />

      <motion.div
        className={`absolute rounded-full blur-3xl ${
          isDark 
            ? 'bg-purple-500/10' 
            : 'bg-purple-400/6'
        }`}
        style={{ width: '30%', height: '30%' }}
        animate={{
          x: ['-5%', '10%', '-5%'],
          y: ['10%', '-5%', '10%'],
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        initial={{ bottom: '10%', left: '30%' }}
      />

      {/* Floating particles - only in dark mode for performance */}
      {isDark && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-violet-400/30"
              animate={{
                y: [0, -100, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                delay: i * 1.5,
                ease: 'easeInOut',
              }}
              style={{
                left: `${15 + i * 15}%`,
                top: `${60 + (i % 3) * 10}%`,
              }}
            />
          ))}
        </>
      )}

      {/* Subtle grid overlay for light mode */}
      {!isDark && (
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #8b5cf6 1px, transparent 1px),
                            linear-gradient(to bottom, #8b5cf6 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      )}

      {/* Noise texture overlay */}
      <div 
        className={`absolute inset-0 ${isDark ? 'opacity-[0.03]' : 'opacity-[0.02]'}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
