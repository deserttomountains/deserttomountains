import { useState, useEffect, useRef } from 'react';
import { Instagram, Send, User, Search, MoreVertical, Phone, Video, Image, FileText, Smile, X } from 'lucide-react';

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
    <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-50 w-80">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Emojis</span>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      <div className="grid grid-cols-10 gap-1 max-h-48 overflow-y-auto">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => onEmojiSelect(emoji)}
            className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded text-base transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

type MessageStatus = 'sending' | 'delivered' | 'read';

interface Message {
  id: number;
  from: 'me' | 'them';
  text: string;
  time: string;
  status: MessageStatus;
}

interface Chat {
  id: string;
  name: string;
  avatar: string; // This will be URL in real implementation
  status: 'online' | 'offline';
  lastMessage: string;
  unread: number;
  messages: Message[];
}

const mockChats: Record<string, Chat[]> = {
  whatsapp: [
    {
      id: 'w1',
      name: 'Rahul Sharma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      status: 'online',
      lastMessage: 'Can you send the invoice?',
      unread: 2,
      messages: [
        { id: 1, from: 'them', text: 'Hi, I am interested in Aura Wall Putty.', time: '09:00', status: 'read' },
        { id: 2, from: 'me', text: 'Hello Rahul! How can I help you?', time: '09:01', status: 'read' },
        { id: 3, from: 'them', text: 'Can you send the invoice?', time: '09:02', status: 'read' },
      ],
    },
    {
      id: 'w2',
      name: 'Priya Patel',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      status: 'offline',
      lastMessage: 'Thank you!',
      unread: 0,
      messages: [
        { id: 1, from: 'them', text: 'Do you have Dhunee samples?', time: '10:00', status: 'read' },
        { id: 2, from: 'me', text: 'Yes, we do! Would you like to order?', time: '10:01', status: 'read' },
        { id: 3, from: 'them', text: 'Thank you!', time: '10:02', status: 'read' },
      ],
    },
    {
      id: 'w3',
      name: 'Amit Kumar',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      status: 'online',
      lastMessage: 'What about bulk pricing?',
      unread: 1,
      messages: [
        { id: 1, from: 'them', text: 'Hi, I need bulk pricing for Aura Wall Putty', time: '11:00', status: 'read' },
        { id: 2, from: 'me', text: 'Sure! How much quantity do you need?', time: '11:01', status: 'read' },
        { id: 3, from: 'them', text: 'What about bulk pricing?', time: '11:02', status: 'delivered' },
      ],
    },
  ],
  instagram: [
    {
      id: 'i1',
      name: 'Sneha Singh',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      status: 'online',
      lastMessage: 'Can I get a shade card?',
      unread: 3,
      messages: [
        { id: 1, from: 'them', text: 'Hi! I love your products', time: '12:00', status: 'read' },
        { id: 2, from: 'me', text: 'Thank you! Which product interests you?', time: '12:01', status: 'read' },
        { id: 3, from: 'them', text: 'Can I get a shade card?', time: '12:02', status: 'delivered' },
      ],
    },
    {
      id: 'i2',
      name: 'Rajesh Verma',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      status: 'offline',
      lastMessage: 'Perfect, thank you!',
      unread: 0,
      messages: [
        { id: 1, from: 'them', text: 'Do you ship to Mumbai?', time: '13:00', status: 'read' },
        { id: 2, from: 'me', text: 'Yes, we ship nationwide!', time: '13:01', status: 'read' },
        { id: 3, from: 'them', text: 'Perfect, thank you!', time: '13:02', status: 'read' },
      ],
    },
  ],
};

type Platform = 'whatsapp' | 'instagram';

function MockChatCRM() {
  const [platform, setPlatform] = useState<Platform>('whatsapp');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(mockChats.whatsapp[0].id);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChatListMobile, setShowChatListMobile] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  const chats = mockChats[platform];
  const selectedChat = chats.find((c) => c.id === selectedChatId) || chats[0];

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage: Message = {
      id: selectedChat.messages.length + 1,
      from: 'me',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sending'
    };
    selectedChat.messages.push(newMessage);
    setInput('');
    setShowEmojiPicker(false);
    
    // Simulate message status change
    setTimeout(() => {
      newMessage.status = 'delivered';
    }, 1000);
    setTimeout(() => {
      newMessage.status = 'read';
    }, 2000);
  };

  const handleEmojiSelect = (emoji: string) => {
    setInput(prev => prev + emoji);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat.messages]);

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

  // Function to render avatar (supports both URLs and fallback)
  const renderAvatar = (avatar: string, name: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12'
    };

    if (avatar.startsWith('http')) {
      return (
        <div className="relative">
          <img 
            src={avatar} 
            alt={name}
            className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-sm`}
            onError={(e) => {
              // Hide the broken image and show fallback
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          {/* Fallback avatar */}
          <div 
            className={`${sizeClasses[size]} bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-lg border-2 border-white shadow-sm hidden`}
            style={{ display: 'none' }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      );
    }

    // Fallback to initials or emoji
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-lg border-2 border-white shadow-sm`}>
        {avatar.startsWith('http') ? name.charAt(0).toUpperCase() : avatar}
      </div>
    );
  };

  // Responsive: show only chat list or chat window on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  useEffect(() => {
    if (!isMobile) setShowChatListMobile(true);
  }, [isMobile, platform]);

  return (
    <div className="h-[calc(100vh-200px)] bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col sm:flex-row overflow-hidden">
      {/* Sidebar (Chat List) */}
      <div className={`bg-gray-50 border-r border-gray-200 flex flex-col w-full sm:w-80 max-w-full sm:max-w-xs transition-all duration-300 z-20 ${showChatListMobile ? 'block' : 'hidden sm:block'}`}>
        {/* Platform Tabs */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-2 bg-white rounded-xl p-1 shadow-sm">
            <button
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                platform === 'whatsapp' 
                  ? 'bg-green-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => { 
                setPlatform('whatsapp'); 
                setSelectedChatId(mockChats.whatsapp[0].id); 
              }}
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span className="hidden xs:inline">WhatsApp</span>
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                platform === 'instagram' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => { 
                setPlatform('instagram'); 
                setSelectedChatId(mockChats.instagram[0].id); 
              }}
            >
              <Instagram className="w-4 h-4" />
              <span className="hidden xs:inline">Instagram</span>
            </button>
          </div>
        </div>
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>
        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center gap-3 p-4 cursor-pointer transition-all duration-200 hover:bg-gray-100 ${
                selectedChatId === chat.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
              }`}
              onClick={() => {
                setSelectedChatId(chat.id);
                if (isMobile) setShowChatListMobile(false);
              }}
            >
              <div className="relative">
                {renderAvatar(chat.avatar, chat.name, 'lg')}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  chat.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 truncate">{chat.name}</h3>
                  <span className="text-xs text-gray-500">{chat.messages[chat.messages.length - 1]?.time}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
              </div>
              {chat.unread > 0 && (
                <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {chat.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col bg-white w-full max-w-full ${showChatListMobile ? 'hidden sm:flex' : 'flex'}`}>
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            {/* Back button for mobile */}
            <button
              className="sm:hidden p-2 mr-2 rounded-lg hover:bg-gray-100"
              onClick={() => setShowChatListMobile(true)}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="relative">
              {renderAvatar(selectedChat.avatar, selectedChat.name, 'md')}
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                selectedChat.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{selectedChat.name}</h2>
              <p className="text-sm text-gray-500">
                {selectedChat.status === 'online' ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-gray-50">
          <div className="space-y-4">
            {selectedChat.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90vw] sm:max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                  msg.from === 'me' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${
                    msg.from === 'me' ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    <span className="text-xs">{msg.time}</span>
                    {msg.from === 'me' && (
                      <div className="flex items-center">
                        {msg.status === 'sending' && <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>}
                        {msg.status === 'delivered' && <div className="w-3 h-3 border border-current rounded-sm"></div>}
                        {msg.status === 'read' && <div className="w-3 h-3 border border-current rounded-sm bg-current"></div>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        {/* Message Input */}
        <div className="p-2 sm:p-4 border-t border-gray-200 bg-white relative">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button 
                ref={emojiButtonRef}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Smile className="w-5 h-5 text-gray-600" />
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 w-64 sm:w-80 z-50">
                  <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
                </div>
              )}
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-gray-50"
              style={{ minWidth: 0 }}
            />
            <button
              onClick={handleSend}
              className="p-2 sm:p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MockChatCRM; 