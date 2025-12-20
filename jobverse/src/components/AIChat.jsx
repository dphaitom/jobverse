import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const AIChat = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Xin chào! 👋 Tôi là AI Career Coach. Tôi có thể giúp gì cho bạn?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => scrollToBottom(), [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const endpoint = token ? `${API_BASE_URL}/v1/ai/chat` : `${API_BASE_URL}/v1/ai/chat/guest`;

      console.log('[AIChat] Sending request to:', endpoint);
      console.log('[AIChat] Message:', userMessage);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ message: userMessage })
      });

      console.log('[AIChat] Response status:', res.status);
      console.log('[AIChat] Response ok:', res.ok);

      const data = await res.json();
      console.log('[AIChat] Response data:', data);

      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.' }]);
      }
    } catch (error) {
      console.error('[AIChat] Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Không thể kết nối. Vui lòng thử lại sau.' }]);
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] glass-card rounded-2xl flex flex-col overflow-hidden z-[9999] shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Career Coach</h3>
            <span className="text-xs text-green-400">● Online</span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-800">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-violet-600 text-white rounded-br-sm' 
                : 'bg-gray-800 text-gray-200 rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="p-3 bg-gray-800 rounded-bl-sm rounded-2xl">
              <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Hỏi AI Coach..."
            className="flex-1 px-4 py-3 text-white placeholder-gray-500 bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button 
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="p-3 text-white bg-violet-600 rounded-xl disabled:opacity-50 hover:bg-violet-700"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;