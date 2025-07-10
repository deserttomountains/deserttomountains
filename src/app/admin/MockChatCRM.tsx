import { useState, useEffect, useRef } from 'react';
import { Instagram, Send, User, Search, MoreVertical, Phone, Video, Image, FileText, Smile, X, Wifi, WifiOff, Settings, MessageCircle } from 'lucide-react';
import whatsappBusinessClientService from '@/services/whatsappBusinessClientService';
import { WhatsAppBusinessChat, WhatsAppBusinessMessage } from '@/services/whatsappBusinessService';

// WhatsApp Icon SVG Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
  </svg>
);

// Simple Emoji Picker Component
const EmojiPicker = ({ onEmojiSelect, onClose }: { onEmojiSelect: (emoji: string) => void; onClose: () => void }) => {
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👌',
    '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆'
  ];

  return (
    <div className="absolute bottom-full left-0 mb-2 bg-white border border-[#D4AF37] rounded-xl shadow-lg p-3 z-50 w-80">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[#5E4E06]">Emojis</span>
        <button onClick={onClose} className="p-1 hover:bg-[#F5F2E8] rounded transition-colors">
          <X className="w-4 h-4 text-[#8B7A1A]" />
        </button>
      </div>
      <div className="grid grid-cols-10 gap-1 max-h-48 overflow-y-auto">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => onEmojiSelect(emoji)}
            className="w-7 h-7 flex items-center justify-center hover:bg-[#F5F2E8] rounded text-base transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

// WhatsApp Business Configuration Modal
const WhatsAppConfigModal = ({ isOpen, onClose, onSave }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (config: any) => void; 
}) => {
  const [config, setConfig] = useState({
    accessToken: '',
    phoneNumberId: '',
    businessAccountId: '',
    webhookVerifyToken: '',
    apiVersion: 'v18.0'
  });

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-[#5E4E06] mb-4">WhatsApp Business API Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#8B7A1A] mb-1">Access Token</label>
            <input
              type="password"
              value={config.accessToken}
              onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
              className="w-full px-3 py-2 border border-[#D4AF37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              placeholder="Enter your WhatsApp Business API access token"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#8B7A1A] mb-1">Phone Number ID</label>
            <input
              type="text"
              value={config.phoneNumberId}
              onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
              className="w-full px-3 py-2 border border-[#D4AF37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              placeholder="Enter your phone number ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#8B7A1A] mb-1">Business Account ID</label>
            <input
              type="text"
              value={config.businessAccountId}
              onChange={(e) => setConfig({ ...config, businessAccountId: e.target.value })}
              className="w-full px-3 py-2 border border-[#D4AF37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              placeholder="Enter your business account ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#8B7A1A] mb-1">Webhook Verify Token</label>
            <input
              type="text"
              value={config.webhookVerifyToken}
              onChange={(e) => setConfig({ ...config, webhookVerifyToken: e.target.value })}
              className="w-full px-3 py-2 border border-[#D4AF37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              placeholder="Enter your webhook verify token"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-[#8B7A1A] border border-[#D4AF37] rounded-lg hover:bg-[#F5F2E8] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Instagram types
interface InstagramMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: Date;
  type: string;
  status: string;
  isFromMe: boolean;
}

interface InstagramChat {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: InstagramMessage[];
}

// 1. Add platform state and mock Instagram data at the top of MockChatCRM
const INSTAGRAM_MOCK_CHATS: InstagramChat[] = [
  {
    id: 'insta1',
    name: 'Jane Doe',
    username: 'jane_insta',
    avatar: '',
    status: 'online',
    lastMessage: 'Hey, I love your posts!',
    lastMessageTime: new Date(),
    unreadCount: 2,
    messages: [
      {
        id: 'm1',
        from: 'jane_insta',
        to: 'business',
        body: 'Hey, I love your posts!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        type: 'text',
        status: 'read',
        isFromMe: false
      },
      {
        id: 'm2',
        from: 'business',
        to: 'jane_insta',
        body: 'Thank you so much! 😊',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        type: 'text',
        status: 'read',
        isFromMe: true
      }
    ]
  },
  {
    id: 'insta2',
    name: 'John Smith',
    username: 'johnny.smith',
    avatar: '',
    status: 'offline',
    lastMessage: 'Can I get a quote?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 120),
    unreadCount: 0,
    messages: [
      {
        id: 'm1',
        from: 'johnny.smith',
        to: 'business',
        body: 'Can I get a quote?',
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        type: 'text',
        status: 'read',
        isFromMe: false
      }
    ]
  }
];

function MockChatCRM() {
  const [chats, setChats] = useState<WhatsAppBusinessChat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChatListMobile, setShowChatListMobile] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState<string>('disconnected');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [useMockData, setUseMockData] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  // 2. Add platform state and mock Instagram data at the top of MockChatCRM
  const [platform, setPlatform] = useState<'whatsapp' | 'instagram'>('whatsapp');
  const [instaChats, setInstaChats] = useState<InstagramChat[]>(INSTAGRAM_MOCK_CHATS);
  const [selectedInstaChatId, setSelectedInstaChatId] = useState<string | null>(INSTAGRAM_MOCK_CHATS[0].id);

  const selectedChat = chats.find((c) => c.id === selectedChatId) || chats[0];

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.number.includes(searchQuery)
  );

  // Load chats on component mount
  useEffect(() => {
    loadChats();
    checkConnectionStatus();
  }, []);

  const loadChats = async () => {
    try {
      if (useMockData) {
        const mockChats = whatsappBusinessClientService.getMockChats();
        setChats(mockChats);
        if (mockChats.length > 0 && !selectedChatId) {
          setSelectedChatId(mockChats[0].id);
        }
      } else {
        const realChats = await whatsappBusinessClientService.getChats();
        setChats(realChats);
        if (realChats.length > 0 && !selectedChatId) {
          setSelectedChatId(realChats[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      // Fallback to mock data
      const mockChats = whatsappBusinessClientService.getMockChats();
      setChats(mockChats);
      if (mockChats.length > 0 && !selectedChatId) {
        setSelectedChatId(mockChats[0].id);
      }
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const status = await whatsappBusinessClientService.getStatus();
      setWhatsappConnected(status.connected);
      setWhatsappStatus(status.status);
    } catch (error) {
      console.error('Error checking status:', error);
      setWhatsappConnected(false);
      setWhatsappStatus('error');
    }
  };

  const handleConnect = async () => {
    try {
      await whatsappBusinessClientService.connect();
      setWhatsappConnected(true);
      setWhatsappStatus('connected');
      await loadChats();
    } catch (error) {
      console.error('Connection error:', error);
      setWhatsappConnected(false);
      setWhatsappStatus('error');
    }
  };

  const handleDisconnect = async () => {
    try {
      await whatsappBusinessClientService.disconnect();
      setWhatsappConnected(false);
      setWhatsappStatus('disconnected');
    } catch (error) {
      console.error('Disconnection error:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedChat) return;
    
    try {
      if (useMockData) {
        // Mock message for demo
        const newMessage: WhatsAppBusinessMessage = {
          id: Date.now().toString(),
          from: 'business',
          to: selectedChat.number,
          body: input,
          timestamp: new Date(),
          type: 'text',
          status: 'sending',
          isFromMe: true
        };

        // Update chat with new message
        setChats(prevChats => 
          prevChats.map(chat => 
            chat.id === selectedChat.id 
              ? {
                  ...chat,
                  messages: [...chat.messages, newMessage],
                  lastMessage: input,
                  lastMessageTime: new Date()
                }
              : chat
          )
        );

        setInput('');
        setShowEmojiPicker(false);
        
        // Simulate message status change
        setTimeout(() => {
          setChats(prevChats => 
            prevChats.map(chat => 
              chat.id === selectedChat.id 
                ? {
                    ...chat,
                    messages: chat.messages.map(msg => 
                      msg.id === newMessage.id 
                        ? { ...msg, status: 'delivered' }
                        : msg
                    )
                  }
                : chat
            )
          );
        }, 1000);

        setTimeout(() => {
          setChats(prevChats => 
            prevChats.map(chat => 
              chat.id === selectedChat.id 
                ? {
                    ...chat,
                    messages: chat.messages.map(msg => 
                      msg.id === newMessage.id 
                        ? { ...msg, status: 'read' }
                        : msg
                    )
                  }
                : chat
            )
          );
        }, 2000);

        // Simulate typing indicator
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      } else {
        // Real WhatsApp Business API message
        const sentMessage = await whatsappBusinessClientService.sendMessage(selectedChat.number, input);
        
        // Update chat with sent message
        setChats(prevChats => 
          prevChats.map(chat => 
            chat.id === selectedChat.id 
              ? {
                  ...chat,
                  messages: [...chat.messages, sentMessage],
                  lastMessage: input,
                  lastMessageTime: new Date()
                }
              : chat
          )
        );

        setInput('');
        setShowEmojiPicker(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setInput(prev => prev + emoji);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiButtonRef.current && !emojiButtonRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to render avatar
  const renderAvatar = (avatar: string | undefined, name: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12'
    };

    if (avatar && avatar.startsWith('http')) {
      return (
        <div className="relative">
          <img 
            src={avatar} 
            alt={name}
            className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-sm`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div 
            className={`${sizeClasses[size]} bg-gradient-to-br from-[#F5F2E8] to-[#D4AF37] rounded-full flex items-center justify-center text-lg border-2 border-white shadow-sm hidden text-[#5E4E06] font-semibold`}
            style={{ display: 'none' }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      );
    }

    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-[#F5F2E8] to-[#D4AF37] rounded-full flex items-center justify-center text-lg border-2 border-white shadow-sm text-[#5E4E06] font-semibold`}>
        {name.charAt(0).toUpperCase()}
      </div>
    );
  };

  const handleConfigSave = async (config: any) => {
    try {
      await whatsappBusinessClientService.updateConfig(config);
      setUseMockData(false);
      await loadChats();
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Failed to save configuration. Please try again.');
    }
  };

  // Responsive: show only chat list or chat window on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  useEffect(() => {
    if (!isMobile) setShowChatListMobile(true);
  }, [isMobile]);

  // 3. Add handleSendInsta for Instagram mock chat
  function handleSendInsta(chat: InstagramChat) {
    if (!input.trim() || !chat) return;
    const newMessage = {
      id: Date.now().toString(),
      from: 'business',
      to: chat.username,
      body: input,
      timestamp: new Date(),
      type: 'text',
      status: 'read',
      isFromMe: true
    };
    setInstaChats(prevChats => prevChats.map(c =>
      c.id === chat.id
        ? {
            ...c,
            messages: [...c.messages, newMessage],
            lastMessage: input,
            lastMessageTime: new Date(),
            unreadCount: 0
          }
        : c
    ));
    setInput('');
    setShowEmojiPicker(false);
  }

  return (
    <div className="space-y-4">
      {/* Platform Toggle */}
      <div className="flex gap-2 mb-2">
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors ${platform === 'whatsapp' ? 'bg-[#D4AF37] text-white border-[#D4AF37]' : 'bg-white text-[#5E4E06] border-[#D4AF37]'}`}
          onClick={() => setPlatform('whatsapp')}
        >
          <WhatsAppIcon className="w-5 h-5" /> WhatsApp
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors ${platform === 'instagram' ? 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white border-pink-500' : 'bg-white text-[#5E4E06] border-pink-500'}`}
          onClick={() => setPlatform('instagram')}
        >
          <Instagram className="w-5 h-5" /> Instagram
        </button>
      </div>
      {/* Platform-specific UI */}
      {platform === 'whatsapp' ? (
        <>
          {/* Messages Header */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-[#D4AF37] p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#5E4E06] mb-2">WhatsApp Business Messages</h2>
                <p className="text-[#8B7A1A] text-sm sm:text-base">Manage customer conversations with WhatsApp Business API</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-wrap gap-3">
                  <div className="bg-[#F5F2E8] rounded-lg px-3 py-2 text-center">
                    <div className="text-lg font-bold text-[#D4AF37]">{chats.filter(c => c.unreadCount > 0).length}</div>
                    <div className="text-xs text-[#8B7A1A]">Unread</div>
                  </div>
                  <div className="bg-[#F5F2E8] rounded-lg px-3 py-2 text-center">
                    <div className="text-lg font-bold text-[#D4AF37]">{chats.length}</div>
                    <div className="text-xs text-[#8B7A1A]">Total Chats</div>
                  </div>
                  <div className="bg-[#F5F2E8] rounded-lg px-3 py-2 text-center">
                    <div className="text-lg font-bold text-[#D4AF37]">{chats.filter(c => c.status === 'online').length}</div>
                    <div className="text-xs text-[#8B7A1A]">Online</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowConfigModal(true)}
                    className="px-4 py-2 bg-[#F5F2E8] hover:bg-[#E8E0D0] text-[#5E4E06] rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Configure
                  </button>
                  <button 
                    onClick={() => setUseMockData(!useMockData)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      useMockData 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    {useMockData ? 'Mock Data' : 'Real API'}
                  </button>
                  {!useMockData && (
                    <button 
                      onClick={whatsappConnected ? handleDisconnect : handleConnect}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        whatsappConnected 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {whatsappConnected ? (
                        <>
                          <WifiOff className="w-4 h-4" />
                          Disconnect
                        </>
                      ) : (
                        <>
                          <Wifi className="w-4 h-4" />
                          Connect
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="h-[calc(100vh-320px)] bg-white rounded-xl sm:rounded-2xl shadow-sm border border-[#D4AF37] flex flex-col sm:flex-row overflow-hidden">
            {/* Sidebar (Chat List) */}
            <div className={`bg-[#F5F2E8] border-r border-[#D4AF37] flex flex-col w-full sm:w-80 max-w-full sm:max-w-xs transition-all duration-300 z-20 ${showChatListMobile ? 'block' : 'hidden sm:block'}`}>
              {/* Header */}
              <div className="p-4 border-b border-[#D4AF37]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-[#5E4E06] flex items-center gap-2">
                    <WhatsAppIcon className="w-5 h-5 text-green-500" />
                    WhatsApp Business
                  </h3>
                  <button 
                    onClick={() => setShowChatListMobile(false)}
                    className="sm:hidden p-1 hover:bg-[#E8E0D0] rounded transition-colors"
                  >
                    <X className="w-5 h-5 text-[#8B7A1A]" />
                  </button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8B7A1A]" />
                  <input
                    type="text"
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-[#D4AF37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                  />
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {filteredChats.length === 0 ? (
                  <div className="p-4 text-center text-[#8B7A1A]">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No chats found</p>
                  </div>
                ) : (
                  filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => {
                        setSelectedChatId(chat.id);
                        setShowChatListMobile(false);
                      }}
                      className={`p-4 border-b border-[#D4AF37] cursor-pointer transition-colors hover:bg-[#E8E0D0] ${
                        selectedChatId === chat.id ? 'bg-[#E8E0D0]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {renderAvatar(chat.avatar, chat.name, 'md')}
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            chat.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-[#5E4E06] truncate">{chat.name}</h4>
                            <span className="text-xs text-[#8B7A1A]">
                              {chat.lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm text-[#8B7A1A] truncate">{chat.lastMessage}</p>
                          {chat.unreadCount > 0 && (
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-[#8B7A1A]">{chat.number}</span>
                              <span className="bg-[#D4AF37] text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                {chat.unreadCount}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-[#D4AF37] bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setShowChatListMobile(true)}
                          className="sm:hidden p-1 hover:bg-[#F5F2E8] rounded transition-colors"
                        >
                          <Search className="w-5 h-5 text-[#8B7A1A]" />
                        </button>
                        <div className="relative">
                          {renderAvatar(selectedChat.avatar, selectedChat.name, 'md')}
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            selectedChat.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#5E4E06]">{selectedChat.name}</h3>
                          <p className="text-sm text-[#8B7A1A]">{selectedChat.number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-[#F5F2E8] rounded transition-colors">
                          <Phone className="w-5 h-5 text-[#8B7A1A]" />
                        </button>
                        <button className="p-2 hover:bg-[#F5F2E8] rounded transition-colors">
                          <Video className="w-5 h-5 text-[#8B7A1A]" />
                        </button>
                        <button className="p-2 hover:bg-[#F5F2E8] rounded transition-colors">
                          <MoreVertical className="w-5 h-5 text-[#8B7A1A]" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 bg-[#F5F2E8]">
                    <div className="space-y-4">
                      {selectedChat.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                            message.isFromMe 
                              ? 'bg-[#D4AF37] text-white' 
                              : 'bg-white text-[#5E4E06] border border-[#D4AF37]'
                          }`}>
                            <p className="text-sm">{message.body}</p>
                            <div className={`flex items-center justify-between mt-1 text-xs ${
                              message.isFromMe ? 'text-white/70' : 'text-[#8B7A1A]'
                            }`}>
                              <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {message.isFromMe && (
                                <span className="ml-2">
                                  {message.status === 'sending' && '⏳'}
                                  {message.status === 'delivered' && '✓✓'}
                                  {message.status === 'read' && '✓✓'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white text-[#5E4E06] border border-[#D4AF37] px-4 py-2 rounded-lg">
                            <div className="flex items-center gap-1">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-[#8B7A1A] rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-[#8B7A1A] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-[#8B7A1A] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                              <span className="text-xs text-[#8B7A1A] ml-2">typing...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-[#D4AF37] bg-white">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                          placeholder="Type a message..."
                          className="w-full px-4 py-2 border border-[#D4AF37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                        />
                        <button
                          ref={emojiButtonRef}
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-[#F5F2E8] rounded transition-colors"
                        >
                          <Smile className="w-5 h-5 text-[#8B7A1A]" />
                        </button>
                        {showEmojiPicker && (
                          <EmojiPicker
                            onEmojiSelect={handleEmojiSelect}
                            onClose={() => setShowEmojiPicker(false)}
                          />
                        )}
                      </div>
                      <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="p-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-[#8B7A1A]">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select a chat to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Modal */}
          <WhatsAppConfigModal
            isOpen={showConfigModal}
            onClose={() => setShowConfigModal(false)}
            onSave={handleConfigSave}
          />
        </>
      ) : (
        // Instagram Mock Chat UI
        <div className="h-[calc(100vh-320px)] bg-white rounded-xl sm:rounded-2xl shadow-sm border border-pink-500 flex flex-col sm:flex-row overflow-hidden">
          {/* Sidebar (Chat List) */}
          <div className="bg-gradient-to-br from-pink-100 to-yellow-100 border-r border-pink-300 flex flex-col w-full sm:w-80 max-w-full sm:max-w-xs transition-all duration-300 z-20">
            <div className="p-4 border-b border-pink-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-pink-600 flex items-center gap-2">
                  <Instagram className="w-5 h-5" /> Instagram DM
                </h3>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {instaChats.filter(chat => chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || chat.username.includes(searchQuery)).length === 0 ? (
                <div className="p-4 text-center text-pink-400">
                  <Instagram className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No chats found</p>
                </div>
              ) : (
                instaChats.filter(chat => chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || chat.username.includes(searchQuery)).map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedInstaChatId(chat.id)}
                    className={`p-4 border-b border-pink-200 cursor-pointer transition-colors hover:bg-pink-50 ${selectedInstaChatId === chat.id ? 'bg-pink-50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      {renderAvatar(chat.avatar, chat.name, 'md')}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-pink-700 truncate">{chat.name}</h4>
                          <span className="text-xs text-pink-400">
                            {chat.lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-pink-400 truncate">{chat.lastMessage}</p>
                        {chat.unreadCount > 0 && (
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-pink-400">@{chat.username}</span>
                            <span className="bg-pink-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {chat.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Chat Window */}
          <div className="flex-1 flex flex-col">
            {(() => {
              const chat = instaChats.find(c => c.id === selectedInstaChatId) || instaChats[0];
              return chat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-pink-300 bg-white">
                    <div className="flex items-center gap-3">
                      {renderAvatar(chat.avatar, chat.name, 'md')}
                      <div>
                        <h3 className="font-semibold text-pink-700">{chat.name}</h3>
                        <p className="text-sm text-pink-400">@{chat.username}</p>
                      </div>
                    </div>
                  </div>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-pink-50 to-yellow-50">
                    <div className="space-y-4">
                      {chat.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                            message.isFromMe
                              ? 'bg-pink-500 text-white'
                              : 'bg-white text-pink-700 border border-pink-300'
                          }`}>
                            <p className="text-sm">{message.body}</p>
                            <div className={`flex items-center justify-between mt-1 text-xs ${
                              message.isFromMe ? 'text-white/70' : 'text-pink-400'
                            }`}>
                              <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                  {/* Message Input */}
                  <div className="p-4 border-t border-pink-300 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendInsta(chat)}
                          placeholder="Type a message..."
                          className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                        <button
                          ref={emojiButtonRef}
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-pink-50 rounded transition-colors"
                        >
                          <Smile className="w-5 h-5 text-pink-400" />
                        </button>
                        {showEmojiPicker && (
                          <EmojiPicker
                            onEmojiSelect={handleEmojiSelect}
                            onClose={() => setShowEmojiPicker(false)}
                          />
                        )}
                      </div>
                      <button
                        onClick={() => handleSendInsta(chat)}
                        disabled={!input.trim()}
                        className="p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-pink-400">
                    <Instagram className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select a chat to start messaging</p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
      {/* Configuration Modal (WhatsApp only) */}
      <WhatsAppConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSave={handleConfigSave}
      />
    </div>
  );
}

export default MockChatCRM; 