import { useState, useEffect, useRef } from 'react';
import { Instagram, Send, User, Search, MoreVertical, Phone, Video, Image, FileText, Smile, X, Wifi, WifiOff, Settings, MessageCircle, ExternalLink, CheckCircle, AlertCircle, Paperclip, Mic, Eye, EyeOff, Clock, Check, CheckCheck, Loader2 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import whatsappBusinessClientService from '@/services/whatsappBusinessClientService';
import { WhatsAppBusinessChat, WhatsAppBusinessMessage } from '@/services/whatsappBusinessService';
import instagramService, { InstagramUser, InstagramConversation } from '@/services/instagramService';

// WhatsApp Icon SVG Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
  </svg>
);

// Enhanced Emoji Picker Component
const EmojiPicker = ({ onEmojiSelect, onClose }: { onEmojiSelect: (emoji: string) => void; onClose: () => void }) => {
  const emojiCategories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠'],
    'Gestures': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸'],
    'Objects': ['💎', '💍', '💐', '💒', '💓', '💔', '💕', '💖', '💗', '💘', '💙', '💚', '💛', '💜', '🖤', '💝', '💞', '💟', '❣️', '💔', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬', '🗨️', '🗯️', '💭', '💤'],
    'Symbols': ['💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬', '🗨️', '🗯️', '💭', '💤', '💮', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬', '🗨️', '🗯️', '💭', '💤', '💮', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬', '🗨️', '🗯️', '💭', '💤', '💮', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬', '🗨️', '🗯️', '💭', '💤', '💮']
  };
  
  const [activeCategory, setActiveCategory] = useState('Smileys');
  
  return (
    <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-50 w-80">
      {/* Category Tabs */}
      <div className="flex gap-1 mb-3 border-b border-gray-200">
        {Object.keys(emojiCategories).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeCategory === category 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Emoji Grid */}
      <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
        {emojiCategories[activeCategory as keyof typeof emojiCategories].map((emoji, index) => (
          <button
            key={index}
            onClick={() => onEmojiSelect(emoji)}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors cursor-pointer"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

// WhatsApp Configuration Modal
const WhatsAppConfigModal = ({ isOpen, onClose }: { 
  isOpen: boolean; 
  onClose: () => void; 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  const [config, setConfig] = useState({
    accessToken: '',
    phoneNumberId: '',
    businessAccountId: '',
    webhookVerifyToken: '',
    apiVersion: 'v18.0'
  });

  const handleInputChange = (field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      // Update the service configuration
      await whatsappBusinessClientService.updateConfig(config);
      
      // Test the connection
      const status = await whatsappBusinessClientService.getStatus();
      
      if (status.connected) {
        setTestResult({
          success: true,
          message: 'WhatsApp Business API connected successfully!'
        });
        // Refresh chats when config is updated
        window.location.reload();
      } else {
        setTestResult({
          success: false,
          message: 'Connection failed. Please check your credentials.'
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'Connection test failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openMetaDeveloperConsole = () => {
    window.open('https://developers.facebook.com/apps/', '_blank');
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-50">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">WhatsApp Business API Configuration</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mt-2">
              Configure your WhatsApp Business API credentials to enable messaging functionality.
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Setup Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Setup Instructions</h3>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Go to <button onClick={openMetaDeveloperConsole} className="text-blue-600 underline flex items-center gap-1">Meta Developer Console <ExternalLink className="w-3 h-3" /></button></li>
                <li>2. Create a new app or use existing one</li>
                <li>3. Add WhatsApp Business API product</li>
                <li>4. Configure phone number and get credentials</li>
                <li>5. Enter the credentials below</li>
              </ol>
            </div>

            {/* Configuration Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Token *
                </label>
                <input
                  type="password"
                  value={config.accessToken}
                  onChange={(e) => handleInputChange('accessToken', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your WhatsApp Business API access token"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number ID *
                </label>
                <input
                  type="text"
                  value={config.phoneNumberId}
                  onChange={(e) => handleInputChange('phoneNumberId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your phone number ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Account ID *
                </label>
                <input
                  type="text"
                  value={config.businessAccountId}
                  onChange={(e) => handleInputChange('businessAccountId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your business account ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook Verify Token
                </label>
                <input
                  type="text"
                  value={config.webhookVerifyToken}
                  onChange={(e) => handleInputChange('webhookVerifyToken', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter webhook verify token (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Version
                </label>
                <input
                  type="text"
                  value={config.apiVersion}
                  onChange={(e) => handleInputChange('apiVersion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="v18.0"
                />
              </div>
            </div>

            {/* Test Result */}
            {testResult && (
              <div className={`p-4 rounded-lg ${
                testResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                    {testResult.message}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleTestConnection}
                disabled={isLoading || !config.accessToken || !config.phoneNumberId}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Test Connection
              </button>
              
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// Add Instagram types
interface InstagramMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: Date;
  type: 'text' | 'image' | 'video' | 'story_reply' | 'reaction' | 'document' | 'audio';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  isFromMe: boolean;
  mediaUrl?: string;
  reaction?: string;
}

interface InstagramChat {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: InstagramMessage[];
  isVerified: boolean;
  isStoryActive: boolean;
}

// Message Status Component
const MessageStatus = ({ status }: { status: string }) => {
  switch (status) {
    case 'sending':
      return <Clock className="w-4 h-4 text-gray-400" />;
    case 'delivered':
      return <CheckCheck className="w-4 h-4 text-gray-400" />;
    case 'read':
      return <CheckCheck className="w-4 h-4 text-blue-500" />;
    default:
      return <Check className="w-4 h-4 text-gray-400" />;
  }
};

// Enhanced Chat Message Component
const ChatMessage = ({ message, isLast }: { message: WhatsAppBusinessMessage; isLast: boolean }) => {
  const [showTime, setShowTime] = useState(false);
  
  return (
    <div
      className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setShowTime(true)}
      onMouseLeave={() => setShowTime(false)}
    >
      <div className={`relative max-w-xs sm:max-w-md lg:max-w-lg ${
        message.isFromMe ? 'order-2' : 'order-1'
      }`}>
        <div className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 ${
          message.isFromMe 
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white rounded-br-md' 
            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md hover:shadow-md'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.body}</p>
        </div>
        
        {/* Message Time and Status */}
        <div className={`flex items-center gap-1 mt-1 px-1 ${
          message.isFromMe ? 'justify-end' : 'justify-start'
        }`}>
          <span className={`text-xs ${
            message.isFromMe ? 'text-green-600' : 'text-gray-500'
          }`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {message.isFromMe && (
            <MessageStatus status={message.status} />
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Chat List Item Component
const ChatListItem = ({ 
  chat, 
  isSelected, 
  onSelect 
}: { 
  chat: WhatsAppBusinessChat; 
  isSelected: boolean; 
  onSelect: () => void; 
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
        isSelected ? 'bg-green-50 border-r-2 border-green-500' : 'border-b border-gray-100'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold ${
            chat.avatar ? '' : 'ring-2 ring-green-200'
          }`}>
            {chat.avatar ? (
              <img src={chat.avatar} alt={chat.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              chat.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
            chat.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`font-semibold truncate ${
              isSelected ? 'text-green-700' : 'text-gray-900'
            }`}>
              {chat.name}
            </h4>
            <span className="text-xs text-gray-500">
              {chat.lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-sm text-gray-600 truncate mt-1">{chat.lastMessage}</p>
          {chat.unreadCount > 0 && (
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">{chat.number}</span>
              <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-medium">
                {chat.unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  // 2. Add platform state and Instagram integration
  const [platform, setPlatform] = useState<'whatsapp' | 'instagram'>('whatsapp');
  const [instaChats, setInstaChats] = useState<InstagramChat[]>([]); // Start with empty array
  const [selectedInstaChatId, setSelectedInstaChatId] = useState<string | null>(null); // Start as null
  
  // Instagram authentication state
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [instagramUser, setInstagramUser] = useState<InstagramUser | null>(null);
  const [instagramLoading, setInstagramLoading] = useState(false);
  const [instagramError, setInstagramError] = useState<string | null>(null);
  
  // Instagram real-time messaging state
  const [instagramSocket, setInstagramSocket] = useState<any>(null);
  const [instagramSocketConnected, setInstagramSocketConnected] = useState(false);
  const [instagramSocketError, setInstagramSocketError] = useState<string | null>(null);
  const [isTypingInsta, setIsTypingInsta] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const selectedChat = chats.find((c) => c.id === selectedChatId) || chats[0];

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.number.includes(searchQuery)
  );

  // Load chats on component mount
  useEffect(() => {
    loadChats();
    checkConnectionStatus();
    checkInstagramAuth();
    setupInstagramSocket();
  }, []);

  // Check Instagram authentication status
  const checkInstagramAuth = () => {
    const token = localStorage.getItem('instagram_access_token');
    const userId = localStorage.getItem('instagram_user_id');
    
          if (token && userId) {
        const pageId = process.env.NEXT_PUBLIC_INSTAGRAM_PAGE_ID || '100504907989379';
        instagramService.initialize(token, userId, pageId);
        setInstagramConnected(true);
        loadInstagramUser();
    }
  };

  // Load Instagram user profile
  const loadInstagramUser = async () => {
    if (!instagramService.isInitialized()) return;
    
    try {
      setInstagramLoading(true);
      const user = await instagramService.getCurrentUser();
      setInstagramUser(user);
    } catch (error) {
      console.error('Error loading Instagram user:', error);
      setInstagramError('Failed to load Instagram profile');
      // Clear invalid tokens
      localStorage.removeItem('instagram_access_token');
      localStorage.removeItem('instagram_user_id');
      setInstagramConnected(false);
    } finally {
      setInstagramLoading(false);
    }
  };

  // Connect to Instagram
  const handleInstagramConnect = () => {
    const authUrl = instagramService.getAuthUrl();
    window.open(authUrl, '_blank', 'width=600,height=700');
  };

  // Disconnect from Instagram
  const handleInstagramDisconnect = () => {
    instagramService.clearAuth();
    localStorage.removeItem('instagram_access_token');
    localStorage.removeItem('instagram_user_id');
    setInstagramConnected(false);
    setInstagramUser(null);
    setInstagramError(null);
    
    // Disconnect WebSocket
    if (instagramSocket) {
      instagramSocket.disconnect();
      setInstagramSocket(null);
      setInstagramSocketConnected(false);
    }
  };

  // Handle Instagram authentication success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const instagramSuccess = urlParams.get('instagram_success');
    const accessToken = urlParams.get('access_token');
    const userId = urlParams.get('user_id');
    
    if (instagramSuccess === 'true' && accessToken && userId) {
      // Store tokens
      localStorage.setItem('instagram_access_token', accessToken);
      localStorage.setItem('instagram_user_id', userId);
      
              // Initialize service
        const pageId = process.env.NEXT_PUBLIC_INSTAGRAM_PAGE_ID || '100504907989379';
        instagramService.initialize(accessToken, userId, pageId);
        setInstagramConnected(true);
        setInstagramError(null);
      
      // Load user profile
      loadInstagramUser();
      
      // Setup WebSocket connection
      setupInstagramSocket();
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Handle Instagram errors
    const instagramError = urlParams.get('instagram_error');
    if (instagramError) {
      setInstagramError(`Instagram connection failed: ${instagramError}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Setup Instagram WebSocket connection
  const setupInstagramSocket = () => {
    try {
      const accessToken = localStorage.getItem('instagram_access_token');
      const userId = localStorage.getItem('instagram_user_id');
      
      if (!accessToken || !userId) {
        console.log('No Instagram credentials found for WebSocket');
        return;
      }

      // Initialize Socket.IO client
      const { io } = require('socket.io-client');
      const socketUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/socket`;
      console.log('Connecting to Socket.IO server:', socketUrl);
      
      const socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });
      
      // Connect to Instagram namespace
      const instagramSocket = socket.of('/instagram');
      console.log('Connecting to Instagram namespace');

      // Connection events
      instagramSocket.on('connect', () => {
        console.log('Instagram WebSocket connected');
        setInstagramSocketConnected(true);
        setInstagramSocketError(null);
        
        // Authenticate with the server
        const pageId = process.env.NEXT_PUBLIC_INSTAGRAM_PAGE_ID || '100504907989379';
        instagramSocket.emit('authenticate', {
          accessToken,
          userId,
          pageId
        });
      });

      instagramSocket.on('authenticated', (data: any) => {
        console.log('Instagram WebSocket authenticated:', data);
        setInstagramSocketConnected(true);
      });

      instagramSocket.on('disconnect', () => {
        console.log('Instagram WebSocket disconnected');
        setInstagramSocketConnected(false);
      });

      instagramSocket.on('error', (error: any) => {
        console.error('Instagram WebSocket error:', error);
        setInstagramSocketError(error.message || 'WebSocket connection error');
      });

      // Message events
      instagramSocket.on('new_message', (message: any) => {
        console.log('New Instagram message received:', message);
        handleNewInstagramMessage(message);
      });

      instagramSocket.on('message_sent', (data: any) => {
        console.log('Instagram message sent:', data);
        handleInstagramMessageSent(data);
      });

      instagramSocket.on('message_delivered', (data: any) => {
        console.log('Instagram message delivered:', data);
        handleInstagramMessageDelivered(data);
      });

      instagramSocket.on('message_read', (data: any) => {
        console.log('Instagram message read:', data);
        handleInstagramMessageRead(data);
      });

      instagramSocket.on('typing_start', (data: any) => {
        console.log('Instagram typing started:', data);
        setTypingUsers(prev => new Set(prev).add(data.recipientId));
      });

      instagramSocket.on('typing_stop', (data: any) => {
        console.log('Instagram typing stopped:', data);
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.recipientId);
          return newSet;
        });
      });

      instagramSocket.on('postback_received', (data: any) => {
        console.log('Instagram postback received:', data);
        handleInstagramPostback(data);
      });

      instagramSocket.on('reaction_received', (data: any) => {
        console.log('Instagram reaction received:', data);
        handleInstagramReaction(data);
      });

      setInstagramSocket(instagramSocket);

    } catch (error) {
      console.error('Error setting up Instagram WebSocket:', error);
      setInstagramSocketError('Failed to setup WebSocket connection');
    }
  };

  // Handle new Instagram message
  const handleNewInstagramMessage = (message: any) => {
    const newMessage: InstagramMessage = {
      id: message.id,
      from: message.from,
      to: message.to,
      body: message.text || message.body || '',
      timestamp: new Date(message.timestamp),
      type: message.type || 'text',
      status: 'delivered',
      isFromMe: false,
      mediaUrl: message.media_url,
    };

    setInstaChats(prevChats => prevChats.map(chat => {
      if (chat.id === message.from || chat.username === message.from) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: newMessage.body,
          lastMessageTime: newMessage.timestamp,
          unreadCount: chat.unreadCount + 1,
        };
      }
      return chat;
    }));

    scrollToBottom();
  };

  // Handle Instagram message sent
  const handleInstagramMessageSent = (data: any) => {
    setInstaChats(prevChats => prevChats.map(chat => ({
      ...chat,
      messages: chat.messages.map(msg => 
        msg.id === data.messageId ? { ...msg, status: 'sent' } : msg
      )
    })));
  };

  // Handle Instagram message delivered
  const handleInstagramMessageDelivered = (data: any) => {
    setInstaChats(prevChats => prevChats.map(chat => ({
      ...chat,
      messages: chat.messages.map(msg => 
        data.messageIds.includes(msg.id) ? { ...msg, status: 'delivered' } : msg
      )
    })));
  };

  // Handle Instagram message read
  const handleInstagramMessageRead = (data: any) => {
    setInstaChats(prevChats => prevChats.map(chat => ({
      ...chat,
      messages: chat.messages.map(msg => 
        msg.id === data.messageId ? { ...msg, status: 'read' } : msg
      )
    })));
  };

  // Handle Instagram postback
  const handleInstagramPostback = (data: any) => {
    const postbackMessage: InstagramMessage = {
      id: data.id,
      from: data.from,
      to: data.to,
      body: `Quick reply: ${data.payload}`,
      timestamp: new Date(data.timestamp),
      type: 'text',
      status: 'delivered',
      isFromMe: false,
    };

    setInstaChats(prevChats => prevChats.map(chat => {
      if (chat.id === data.from || chat.username === data.from) {
        return {
          ...chat,
          messages: [...chat.messages, postbackMessage],
          lastMessage: postbackMessage.body,
          lastMessageTime: postbackMessage.timestamp,
          unreadCount: chat.unreadCount + 1,
        };
      }
      return chat;
    }));
  };

  // Handle Instagram reaction
  const handleInstagramReaction = (data: any) => {
    const reactionMessage: InstagramMessage = {
      id: data.id,
      from: data.from,
      to: data.to,
      body: '',
      timestamp: new Date(data.timestamp),
      type: 'reaction',
      status: 'delivered',
      isFromMe: false,
      reaction: data.emoji,
    };

    setInstaChats(prevChats => prevChats.map(chat => {
      if (chat.id === data.from || chat.username === data.from) {
        return {
          ...chat,
          messages: [...chat.messages, reactionMessage],
          lastMessage: `Reacted with ${data.emoji}`,
          lastMessageTime: reactionMessage.timestamp,
          unreadCount: chat.unreadCount + 1,
        };
      }
      return chat;
    }));
  };

  const loadChats = async () => {
    try {
      // Load existing chats with full conversation history
      const realChats = await whatsappBusinessClientService.loadExistingChats();
      setChats(realChats);
      if (realChats.length > 0 && !selectedChatId) {
        setSelectedChatId(realChats[0].id);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      // Show empty state if no chats available
      setChats([]);
    }
  };

  // Load more chat history for a specific conversation
  const loadChatHistory = async (chatId: string, limit: number = 100) => {
    try {
      const chat = chats.find(c => c.id === chatId);
      if (!chat) return;

      const messages = await whatsappBusinessClientService.getChatHistory(chat.number, limit);
      
      // Update the chat with loaded messages
      setChats(prevChats => 
        prevChats.map(c => 
          c.id === chatId 
            ? { ...c, messages: messages }
            : c
        )
      );
    } catch (error) {
      console.error('Error loading chat history:', error);
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
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setInput(prev => prev + emoji);
  };

  const handleAttachment = (type: 'image' | 'document' | 'camera') => {
    const input = document.createElement('input');
    
    switch (type) {
      case 'image':
        input.type = 'file';
        input.accept = 'image/*';
        break;
      case 'document':
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx';
        break;
      case 'camera':
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        break;
    }
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Here you would typically upload the file and send the message
        const message = `📎 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        setInput(message);
      }
    };
    
    input.click();
    setShowAttachmentMenu(false);
  };

  const handleVoiceNote = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      // Here you would implement actual voice recording
      setTimeout(() => {
        setIsRecording(false);
        // Simulate sending voice note
        const message = '🎤 Voice message (0:15)';
        setInput(message);
      }, 3000);
    } else {
      // Stop recording
      setIsRecording(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  // Close emoji picker and attachment menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiButtonRef.current && !emojiButtonRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      
      // Close attachment menu when clicking outside
      const attachmentButton = document.querySelector('[data-attachment-button]');
      if (attachmentButton && !attachmentButton.contains(event.target as Node)) {
        setShowAttachmentMenu(false);
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



  // Responsive: show only chat list or chat window on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  useEffect(() => {
    if (!isMobile) setShowChatListMobile(true);
  }, [isMobile]);

  // Enhanced handleSendInsta for Instagram real-time messaging
  async function handleSendInsta(chat: InstagramChat) {
    if (!input.trim() || !chat) return;
    
    const messageText = input.trim();
    setInput('');
    setShowEmojiPicker(false);
    
    // Create temporary message for immediate UI feedback
    const tempMessage: InstagramMessage = {
      id: Date.now().toString(),
      from: 'business',
      to: chat.username,
      body: messageText,
      timestamp: new Date(),
      type: 'text',
      status: 'sending',
      isFromMe: true
    };
    
    // Add message to UI immediately
    setInstaChats(prevChats => prevChats.map(c =>
      c.id === chat.id
        ? {
            ...c,
            messages: [...c.messages, tempMessage],
            lastMessage: messageText,
            lastMessageTime: new Date(),
            unreadCount: 0
          }
        : c
    ));
    
    scrollToBottom();
    
    // Send message via WebSocket if connected
    if (instagramSocket && instagramSocketConnected) {
      try {
        // Send typing indicator
        instagramSocket.emit('typing_start', { recipientId: chat.id });
        
        // Send message
        instagramSocket.emit('send_message', {
          recipientId: chat.id,
          message: messageText,
          messageType: 'text'
        });
        
        // Stop typing indicator after a delay
        setTimeout(() => {
          instagramSocket.emit('typing_stop', { recipientId: chat.id });
        }, 1000);
        
      } catch (error) {
        console.error('Error sending Instagram message:', error);
        // Update message status to failed
        setInstaChats(prevChats => prevChats.map(c =>
          c.id === chat.id
            ? {
                ...c,
                messages: c.messages.map(msg =>
                  msg.id === tempMessage.id
                    ? { ...msg, status: 'failed' }
                    : msg
                )
              }
            : c
        ));
      }
    } else {
      // Fallback to mock behavior if WebSocket not connected
      console.log('WebSocket not connected, using mock behavior');
      
      // Update message status to sent
      setInstaChats(prevChats => prevChats.map(c =>
        c.id === chat.id
          ? {
              ...c,
              messages: c.messages.map(msg =>
                msg.id === tempMessage.id
                  ? { ...msg, status: 'sent' }
                  : msg
              )
            }
          : c
      ));
      
      // Simulate message status changes
      setTimeout(() => {
        setInstaChats(prevChats => prevChats.map(c =>
          c.id === chat.id
            ? {
                ...c,
                messages: c.messages.map(msg =>
                  msg.id === tempMessage.id
                    ? { ...msg, status: 'delivered' }
                    : msg
                )
              }
            : c
        ));
      }, 1000);
      
      setTimeout(() => {
        setInstaChats(prevChats => prevChats.map(c =>
          c.id === chat.id
            ? {
                ...c,
                messages: c.messages.map(msg =>
                  msg.id === tempMessage.id
                    ? { ...msg, status: 'read' }
                    : msg
                )
              }
            : c
        ));
      }, 2000);
      
      // Simulate auto-reply for demo
      setTimeout(() => {
        const autoReply: InstagramMessage = {
          id: (Date.now() + 1).toString(),
          from: chat.username,
          to: 'business',
          body: 'Thanks for your message! I\'ll get back to you soon 😊',
          timestamp: new Date(),
          type: 'text',
          status: 'delivered',
          isFromMe: false
        };
        
        setInstaChats(prevChats => prevChats.map(c =>
          c.id === chat.id
            ? {
                ...c,
                messages: [...c.messages, autoReply],
                lastMessage: autoReply.body,
                lastMessageTime: new Date(),
                unreadCount: 1
              }
            : c
        ));
        
        scrollToBottom();
      }, 3000);
    }
  }

  // Remove mock data and load real Instagram DMs
  useEffect(() => {
    if (platform === 'instagram' && instagramConnected) {
      const fetchInstagramChats = async () => {
        try {
          setInstagramLoading(true);
          console.log('Fetching real Instagram conversations...');
          // Fetch real Instagram conversations
          const conversations = await instagramService.getDirectMessages();
          console.log('Instagram conversations received:', conversations);
          // Map to InstagramChat UI structure
          const chats = conversations.map((conv) => {
            const user = conv.participants.find((p) => p.id !== instagramService['userId']) || conv.participants[0];
            return {
              id: conv.id,
              name: user?.full_name || user?.username || 'Unknown',
              username: user?.username || '',
              avatar: user?.profile_picture_url || '',
              status: 'online' as const, // Real status not available from API
              lastMessage: conv.last_message?.text || '',
              lastMessageTime: conv.updated_time ? new Date(conv.updated_time) : new Date(),
              unreadCount: conv.unread_count || 0,
              messages: (conv.messages || []).map((msg) => ({
                id: msg.id,
                from: msg.from?.username || '',
                to: msg.to?.username || '',
                body: msg.text || '',
                timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
                type: msg.type || 'text',
                status: (msg.status as 'sending' | 'sent' | 'delivered' | 'read' | 'failed') || 'delivered',
                isFromMe: msg.from?.id === instagramService['userId'],
                mediaUrl: msg.media_url,
                reaction: msg.reaction,
              })),
              isVerified: user?.is_verified || false,
              isStoryActive: false, // Not available from API
            };
          });
          setInstaChats(chats);
          if (chats.length > 0) {
            setSelectedInstaChatId(chats[0].id);
          }
        } catch (error) {
          setInstagramError('Failed to load Instagram chats');
          setInstaChats([]);
        } finally {
          setInstagramLoading(false);
        }
      };
      fetchInstagramChats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, instagramConnected]);

  return (
    <div className="space-y-4">
      {/* Enhanced Platform Toggle */}
      <div className="flex gap-3 mb-4">
        <button
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer ${
            platform === 'whatsapp' 
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' 
              : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
          }`}
          onClick={() => setPlatform('whatsapp')}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            platform === 'whatsapp' ? 'bg-white/20' : 'bg-green-100'
          }`}>
            <WhatsAppIcon className="w-5 h-5" />
          </div>
          <span className="font-semibold">WhatsApp</span>
        </button>
        <button
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer ${
            platform === 'instagram' 
              ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 text-white shadow-lg' 
              : 'bg-white text-gray-700 border border-gray-200 hover:border-pink-300'
          }`}
          onClick={() => setPlatform('instagram')}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            platform === 'instagram' ? 'bg-white/20' : 'bg-pink-100'
          }`}>
            <Instagram className="w-5 h-5" />
          </div>
          <span className="font-semibold">Instagram</span>
        </button>
      </div>
      {/* Platform-specific UI */}
      {platform === 'whatsapp' ? (
        <>
          {/* Enhanced Messages Header */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">WhatsApp Business Messages</h2>
                <p className="text-gray-600 text-sm sm:text-base">Manage customer conversations with WhatsApp Business API</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-wrap gap-3">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl px-4 py-3 text-center border border-green-200">
                    <div className="text-xl font-bold text-green-600">{chats.filter(c => c.unreadCount > 0).length}</div>
                    <div className="text-xs text-green-700 font-medium">Unread</div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl px-4 py-3 text-center border border-blue-200">
                    <div className="text-xl font-bold text-blue-600">{chats.length}</div>
                    <div className="text-xs text-blue-700 font-medium">Total Chats</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl px-4 py-3 text-center border border-purple-200">
                    <div className="text-xl font-bold text-purple-600">{chats.filter(c => c.status === 'online').length}</div>
                    <div className="text-xs text-purple-700 font-medium">Online</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowConfigModal(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer ${
                      whatsappConnected 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    {whatsappConnected ? 'WhatsApp Connected' : 'Configure WhatsApp'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Chat Interface */}
          <div className="h-[calc(100vh-320px)] bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 flex flex-col sm:flex-row overflow-hidden">
            {/* Enhanced Sidebar (Chat List) */}
            <div className={`bg-gray-50 border-r border-gray-200 flex flex-col w-full sm:w-80 max-w-full sm:max-w-xs transition-all duration-300 z-20 ${showChatListMobile ? 'block' : 'hidden sm:block'}`}>
              {/* Enhanced Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <WhatsAppIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">WhatsApp Business</h3>
                      <p className="text-xs text-gray-500">Manage conversations</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowChatListMobile(false)}
                    className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                
                {/* Enhanced Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Enhanced Chat List */}
              <div className="flex-1 overflow-y-auto bg-white">
                {filteredChats.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No conversations found</p>
                    <p className="text-sm">Try adjusting your search terms</p>
                  </div>
                ) : (
                  filteredChats.map((chat) => (
                    <ChatListItem
                      key={chat.id}
                      chat={chat}
                      isSelected={selectedChatId === chat.id}
                      onSelect={() => {
                        setSelectedChatId(chat.id);
                        setShowChatListMobile(false);
                        // Load chat history when a chat is selected
                        loadChatHistory(chat.id, 100);
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Enhanced Chat Window */}
            <div className="flex-1 flex flex-col bg-gray-50">
              {selectedChat ? (
                <>
                  {/* Enhanced Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setShowChatListMobile(true)}
                          className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Search className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold ${
                            selectedChat.avatar ? '' : 'ring-2 ring-green-200'
                          }`}>
                            {selectedChat.avatar ? (
                              <img src={selectedChat.avatar} alt={selectedChat.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              selectedChat.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            selectedChat.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{selectedChat.name}</h3>
                          <p className="text-sm text-gray-500">{selectedChat.number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                                <Phone className="w-5 h-5 text-gray-600" />
                              </button>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                              <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs">
                                Call
                                <Tooltip.Arrow className="fill-gray-900" />
                              </Tooltip.Content>
                            </Tooltip.Portal>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                        
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                                <Video className="w-5 h-5 text-gray-600" />
                              </button>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                              <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs">
                                Video Call
                                <Tooltip.Arrow className="fill-gray-900" />
                              </Tooltip.Content>
                            </Tooltip.Portal>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                        
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                              <MoreVertical className="w-5 h-5 text-gray-600" />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content className="bg-white rounded-lg shadow-lg border border-gray-200 p-1 min-w-[150px]">
                              <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                                <User className="w-4 h-4" />
                                View Profile
                              </DropdownMenu.Item>
                              <DropdownMenu.Item 
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                                onClick={() => {
                                  if (selectedChat) {
                                    loadChatHistory(selectedChat.id, 200);
                                  }
                                }}
                              >
                                <FileText className="w-4 h-4" />
                                Load More Messages
                              </DropdownMenu.Item>
                              <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                              <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer">
                                <AlertCircle className="w-4 h-4" />
                                Block Contact
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Messages */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="space-y-4">
                      {selectedChat.messages.map((message, index) => (
                        <ChatMessage
                          key={message.id}
                          message={message}
                          isLast={index === selectedChat.messages.length - 1}
                        />
                      ))}
                      
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white text-gray-800 border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                              <span className="text-xs text-gray-500">typing...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Enhanced Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <button 
                          onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                          data-attachment-button
                        >
                          <Paperclip className="w-5 h-5 text-gray-600" />
                        </button>
                        {showAttachmentMenu && (
                          <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-50 min-w-[200px]">
                            <div className="space-y-2">
                              <button
                                onClick={() => handleAttachment('image')}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                              >
                                <Image className="w-4 h-4" />
                                Photo & Video
                              </button>
                              <button
                                onClick={() => handleAttachment('document')}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                              >
                                <FileText className="w-4 h-4" />
                                Document
                              </button>
                              <button
                                onClick={() => handleAttachment('camera')}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                              >
                                <Video className="w-4 h-4" />
                                Camera
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                          placeholder="Type a message..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all duration-200 text-gray-900 placeholder-gray-500"
                        />
                        <button
                          ref={emojiButtonRef}
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                        >
                          <Smile className="w-5 h-5 text-gray-600" />
                        </button>
                        {showEmojiPicker && (
                          <EmojiPicker
                            onEmojiSelect={handleEmojiSelect}
                            onClose={() => setShowEmojiPicker(false)}
                          />
                        )}
                      </div>
                      <button 
                        onClick={handleVoiceNote}
                        className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${
                          isRecording 
                            ? 'bg-red-500 text-white animate-pulse' 
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        <Mic className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-lg font-medium mb-2">Select a conversation</p>
                    <p className="text-sm opacity-70">Choose a chat to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Modal */}
          <WhatsAppConfigModal
            isOpen={showConfigModal}
            onClose={() => setShowConfigModal(false)}
          />
        </>
      ) : (
        <>
          {/* Instagram Messages Header */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-pink-500 p-4 sm:p-6 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 bg-clip-text text-transparent mb-2">
                  Instagram Direct Messages
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">Manage customer conversations through Instagram DMs</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-wrap gap-3">
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg px-3 py-2 text-center border border-pink-200">
                    <div className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                      {instaChats.filter(c => c.unreadCount > 0).length}
                    </div>
                    <div className="text-xs text-gray-600">Unread</div>
                  </div>
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg px-3 py-2 text-center border border-pink-200">
                    <div className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                      {instaChats.length}
                    </div>
                    <div className="text-xs text-gray-600">Conversations</div>
                  </div>
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg px-3 py-2 text-center border border-pink-200">
                    <div className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                      {instaChats.filter(c => c.status === 'online').length}
                    </div>
                    <div className="text-xs text-gray-600">Online</div>
                  </div>
                </div>
                              <div className="flex items-center gap-3">
                {instagramConnected ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 font-medium">Connected</span>
                    {instagramUser && (
                      <div className="flex items-center gap-2 text-xs text-white/80">
                        <span>@{instagramUser.username}</span>
                        {instagramUser.is_verified && (
                          <CheckCircle className="w-3 h-3 text-blue-400" />
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-sm text-white/80">Not Connected</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {instagramConnected ? (
                    <button
                      onClick={handleInstagramDisconnect}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg transition-colors"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={handleInstagramConnect}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Connect
                    </button>
                  )}
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* Instagram Error Display */}
          {instagramError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Instagram Connection Error</span>
              </div>
              <p className="text-red-500 text-sm mt-1">{instagramError}</p>
              <button
                onClick={() => setInstagramError(null)}
                className="text-red-400 hover:text-red-600 text-xs mt-2 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Enhanced Instagram Mock Chat UI */}
          <div className="h-[calc(100vh-420px)] bg-white rounded-xl sm:rounded-2xl shadow-sm border border-pink-500 flex flex-col sm:flex-row overflow-hidden">
          {/* Sidebar (Chat List) */}
          <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50 border-r border-pink-200 flex flex-col w-full sm:w-80 max-w-full sm:max-w-xs transition-all duration-300 z-20">
            {/* Instagram Header */}
            <div className="p-4 border-b border-pink-200 bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Instagram className="w-5 h-5" /> Instagram Direct
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-xs text-white/80">Connected</span>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-300" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-sm text-white placeholder-white/70"
                />
              </div>
            </div>
            
            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {instaChats.filter(chat => chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || chat.username.includes(searchQuery)).length === 0 ? (
                <div className="p-8 text-center text-pink-400">
                  <Instagram className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No conversations found</p>
                  <p className="text-xs opacity-70 mt-1">Try adjusting your search</p>
                </div>
              ) : (
                instaChats.filter(chat => chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || chat.username.includes(searchQuery)).map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedInstaChatId(chat.id)}
                    className={`p-4 border-b border-pink-100 cursor-pointer transition-all duration-200 hover:bg-white/50 ${selectedInstaChatId === chat.id ? 'bg-white/70 shadow-sm' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar with Story Ring */}
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg ${chat.isStoryActive ? 'ring-2 ring-pink-500 ring-offset-2' : ''}`}>
                          {chat.avatar ? (
                            <img src={chat.avatar} alt={chat.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            chat.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        {/* Online Status */}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          chat.status === 'online' ? 'bg-green-500' : 
                          chat.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <h4 className="font-semibold text-gray-800 truncate">{chat.name}</h4>
                            {chat.isVerified && (
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {chat.lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-1">{chat.lastMessage}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">@{chat.username}</span>
                          {chat.unreadCount > 0 && (
                            <span className="bg-pink-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-medium">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50">
            {(() => {
              const chat = instaChats.find(c => c.id === selectedInstaChatId) || instaChats[0];
              return chat ? (
                <>
                  {/* Enhanced Chat Header */}
                  <div className="p-4 border-b border-pink-200 bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold ${chat.isStoryActive ? 'ring-2 ring-pink-500 ring-offset-2' : ''}`}>
                            {chat.avatar ? (
                              <img src={chat.avatar} alt={chat.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              chat.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            chat.status === 'online' ? 'bg-green-500' : 
                            chat.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <h3 className="font-semibold text-gray-800">{chat.name}</h3>
                            {chat.isVerified && (
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">@{chat.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-pink-100 rounded-full transition-colors">
                          <Phone className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-pink-100 rounded-full transition-colors">
                          <Video className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-pink-100 rounded-full transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Messages */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      {chat.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${
                            message.isFromMe
                              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                              : 'bg-white text-gray-800 border border-gray-200'
                          }`}>
                            {message.type === 'reaction' ? (
                              <div className="text-center">
                                <span className="text-2xl">{message.reaction}</span>
                              </div>
                            ) : (
                              <p className="text-sm leading-relaxed">{message.body}</p>
                            )}
                            <div className={`flex items-center justify-between mt-2 text-xs ${
                              message.isFromMe ? 'text-white/70' : 'text-gray-500'
                            }`}>
                              <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {message.isFromMe && (
                                <span className="ml-2">
                                  {message.status === 'sent' && '✓'}
                                  {message.status === 'delivered' && '✓✓'}
                                  {message.status === 'read' && '✓✓'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                  
                  {/* Enhanced Message Input */}
                  <div className="p-4 border-t border-pink-200 bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <button className="p-2 hover:bg-pink-100 rounded-full transition-colors">
                        <Image className="w-5 h-5 text-gray-600" />
                      </button>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendInsta(chat)}
                          placeholder="Message..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent text-sm"
                        />
                        <button
                          ref={emojiButtonRef}
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-pink-100 rounded-full transition-colors"
                        >
                          <Smile className="w-5 h-5 text-gray-600" />
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
                        className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Instagram className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-lg font-medium mb-2">Select a conversation</p>
                    <p className="text-sm opacity-70">Choose a chat to start messaging</p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
        </>
      )}
      {/* Configuration Modal (WhatsApp only) */}
      <WhatsAppConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />
    </div>
  );
}

export default MockChatCRM; 