// src/pages/MessagesPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  MessageCircle, Send, ArrowLeft, User, Building2, 
  Clock, Check, CheckCheck
} from 'lucide-react';
import { Navbar, Footer, LoadingSpinner, EmptyState } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { chatAPI } from '../services/api';
import toast from 'react-hot-toast';

const MessagesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchConversations();
  }, [isAuthenticated]);

  // Auto-open conversation if conversationId in URL
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === parseInt(conversationId));
      if (conv) {
        selectConversation(conv);
      }
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await chatAPI.getConversations();
      setConversations(response.data?.content || response.data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setMessagesLoading(true);
    try {
      const response = await chatAPI.getMessages(conversation.id);
      // Messages are in DESC order, reverse for display
      const msgs = response.data?.content || response.data || [];
      setMessages(msgs.reverse());
      
      // Mark as read
      await chatAPI.markAsRead(conversation.id).catch(() => {});
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Không thể tải tin nhắn');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const response = await chatAPI.sendMessage(selectedConversation.id, newMessage.trim());
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      
      // Update conversation's last message
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, lastMessage: newMessage.trim(), lastMessageAt: new Date().toISOString() }
          : conv
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (conversation) => {
    if (user?.role === 'EMPLOYER') {
      return {
        name: conversation.candidateName || 'Ứng viên',
        type: 'candidate'
      };
    } else {
      return {
        name: conversation.companyName || 'Công ty',
        type: 'company'
      };
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-gray-100">
        <Navbar />
        <div className="pt-24"><LoadingSpinner size="lg" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-100">
      <Navbar />
      
      <main className="pt-20 pb-0 h-screen flex flex-col">
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 flex flex-col">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-violet-400" />
              Tin nhắn
            </h1>
          </div>

          <div className="flex-1 grid lg:grid-cols-3 gap-4 min-h-0">
            {/* Conversations List */}
            <div className="lg:col-span-1 glass-card rounded-2xl flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h2 className="font-semibold text-white">Hội thoại</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {conversations.length > 0 ? (
                  <div className="divide-y divide-gray-800/50">
                    {conversations.map(conv => {
                      const other = getOtherParticipant(conv);
                      return (
                        <button
                          key={conv.id}
                          onClick={() => selectConversation(conv)}
                          className={`w-full text-left p-4 hover:bg-gray-800/50 transition-colors ${
                            selectedConversation?.id === conv.id ? 'bg-violet-500/10 border-l-2 border-violet-500' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              other.type === 'company' ? 'bg-violet-500/20' : 'bg-blue-500/20'
                            }`}>
                              {other.type === 'company' ? (
                                <Building2 className="w-5 h-5 text-violet-400" />
                              ) : (
                                <User className="w-5 h-5 text-blue-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-white truncate">{other.name}</h3>
                                <span className="text-xs text-gray-500">{formatTime(conv.lastMessageAt)}</span>
                              </div>
                              <p className="text-sm text-gray-400 truncate">{conv.lastMessage || 'Bắt đầu trò chuyện...'}</p>
                            </div>
                            {conv.unreadCount > 0 && (
                              <span className="w-5 h-5 rounded-full bg-violet-500 text-white text-xs flex items-center justify-center">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Chưa có hội thoại nào</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2 glass-card rounded-2xl flex flex-col overflow-hidden">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-800 flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedConversation(null)}
                      className="lg:hidden p-2 hover:bg-gray-800 rounded-lg"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                      {getOtherParticipant(selectedConversation).type === 'company' ? (
                        <Building2 className="w-5 h-5 text-violet-400" />
                      ) : (
                        <User className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{getOtherParticipant(selectedConversation).name}</h3>
                      {selectedConversation.jobTitle && (
                        <p className="text-xs text-gray-400">Về: {selectedConversation.jobTitle}</p>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messagesLoading ? (
                      <LoadingSpinner />
                    ) : messages.length > 0 ? (
                      messages.map(msg => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            msg.senderId === user?.id 
                              ? 'bg-violet-500 text-white rounded-br-md' 
                              : 'bg-gray-800 text-gray-100 rounded-bl-md'
                          }`}>
                            <p>{msg.content}</p>
                            <div className={`flex items-center gap-1 mt-1 text-xs ${
                              msg.senderId === user?.id ? 'text-violet-200' : 'text-gray-500'
                            }`}>
                              <span>{formatTime(msg.createdAt)}</span>
                              {msg.senderId === user?.id && (
                                msg.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        Bắt đầu cuộc trò chuyện
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 input-field"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="p-3 btn-primary rounded-xl disabled:opacity-50"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Chọn một hội thoại</h3>
                    <p className="text-gray-400">Chọn hội thoại từ danh sách bên trái để bắt đầu nhắn tin</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MessagesPage;
