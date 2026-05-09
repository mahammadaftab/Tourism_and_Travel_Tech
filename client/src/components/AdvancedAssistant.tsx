import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrip } from '../context/TripContext';
import { assistantAPI } from '../services/api';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  MapPin, 
  Leaf, 
  Users, 
  Zap,
  MessageCircle
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  category?: 'greeting' | 'weather' | 'sustainability' | 'crowd' | 'hiddenGems' | 'general' | 'error';
  context?: {
    destination?: string;
    weather?: any;
    sustainabilityScore?: number;
    crowdLevel?: string;
  };
}

interface Suggestion {
  text: string;
  icon: React.ReactNode;
  category: string;
}

const AdvancedAssistant: React.FC = () => {
  const { preferences } = useTrip();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'bot',
      content: "🌟 Hello! I'm your Premium Travel Assistant. I'm here to help you plan the perfect journey with personalized recommendations, real-time insights, and smart suggestions. Where would you like to explore today?",
      timestamp: new Date(),
      category: 'greeting'
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<any>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Speech recognition setup
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = preferences.language || 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    // Speech synthesis setup
    synthRef.current = window.speechSynthesis;

    // Load initial suggestions
    fetchSuggestions();
  }, [preferences.destination, preferences.language]);

  useEffect(() => {
    // Reset auto-scroll state when new messages come
    setShouldAutoScroll(true);
    
    // Always scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollToBottom();
    }, 50);
    
    // Make sure input field is ready after messages update
    setTimeout(() => {
      const inputElement = document.querySelector('input[placeholder*="Ask me"]') as HTMLInputElement;
      if (inputElement && !inputElement.disabled) {
        inputElement.focus();
      }
    }, 100);
  }, [messages]);

  // Effect to ensure input is ready after initial render
  useEffect(() => {
    // This ensures the input field is ready after the component mounts
    // and after the initial welcome message is displayed
    setTimeout(() => {
      scrollToBottom();
      // Focus the input field after initial render
      const inputElement = document.querySelector('input[placeholder*="Ask me"]') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    }, 100);
  }, []);

  const scrollToBottom = () => {
    // Using requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
      if (messagesContainerRef.current) {
        // Scroll to the absolute bottom
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        
        // Also update the shouldAutoScroll state to reflect that we're at the bottom
        setShouldAutoScroll(true);
      }
    });
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = Math.abs(scrollTop + clientHeight - scrollHeight) <= 10;
      setShouldAutoScroll(isAtBottom);
      
      // If user scrolls up, temporarily disable auto-scroll
      if (!isAtBottom) {
        setShouldAutoScroll(false);
      }
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await assistantAPI.getSuggestions(
        preferences.language,
        preferences.destination || 'your dream destination'
      );
      
      // Transform suggestions into rich format
      const richSuggestions: Suggestion[] = [
        {
          text: response.data.suggestions?.[0] || "What's the weather like there?",
          icon: <CloudSun className="w-4 h-4" />,
          category: 'weather'
        },
        {
          text: response.data.suggestions?.[1] || "Show me hidden gems",
          icon: <Compass className="w-4 h-4" />,
          category: 'discovery'
        },
        {
          text: response.data.suggestions?.[2] || "Tell me about sustainability",
          icon: <Leaf className="w-4 h-4" />,
          category: 'sustainability'
        },
        {
          text: response.data.suggestions?.[3] || "What are the crowd levels?",
          icon: <Users className="w-4 h-4" />,
          category: 'crowd'
        }
      ];
      
      setSuggestions(richSuggestions);
    } catch (err) {
      console.error('Suggestions error:', err);
      // Fallback suggestions
      setSuggestions([
        { text: "What's the weather like?", icon: <CloudSun className="w-4 h-4" />, category: 'weather' },
        { text: "Show me hidden gems", icon: <Compass className="w-4 h-4" />, category: 'discovery' },
        { text: "Tell me about sustainability", icon: <Leaf className="w-4 h-4" />, category: 'sustainability' },
        { text: "What are the crowd levels?", icon: <Users className="w-4 h-4" />, category: 'crowd' }
      ]);
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'weather': return <CloudSun className="w-5 h-5 text-blue-500" />;
      case 'sustainability': return <Leaf className="w-5 h-5 text-green-500" />;
      case 'crowd': return <Users className="w-5 h-5 text-purple-500" />;
      case 'hiddenGems': return <Compass className="w-5 h-5 text-amber-500" />;
      case 'greeting': return <Sparkles className="w-5 h-5 text-pink-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <MessageCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'weather': return 'from-blue-500 to-cyan-500';
      case 'sustainability': return 'from-green-500 to-emerald-500';
      case 'crowd': return 'from-purple-500 to-violet-500';
      case 'hiddenGems': return 'from-amber-500 to-orange-500';
      case 'greeting': return 'from-pink-500 to-rose-500';
      case 'error': return 'from-red-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    
    // Clear input after a small delay to ensure message is sent
    setTimeout(() => {
      setInput('');
    }, 100);

    try {
      const response = await assistantAPI.chat({
        message: content,
        language: preferences.language,
        context: {
          destination: preferences.destination,
          weather: null,
          sustainabilityScore: 75,
          crowdLevel: 'low',
        },
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.data.response,
        timestamp: new Date(),
        category: response.data.type,
        context: {
          destination: preferences.destination,
          sustainabilityScore: 75,
          crowdLevel: 'low',
        }
      };

      setMessages((prev) => [...prev, botMessage]);
          
      // Force scroll to bottom after adding message
      setTimeout(() => {
        scrollToBottom();
      }, 50);
          
      // Speak the response if enabled
      if (isSpeaking) {
        speakText(response.data.response);
      }
      
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I'm sorry, I couldn't process your request. Please try again.",
        timestamp: new Date(),
        category: 'error'
      };
      setMessages((prev) => [...prev, errorMessage]);
      
      // Force scroll to bottom after error message
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    } finally {
      setIsTyping(false);
    }
  };

  const speakText = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = preferences.language === 'es' ? 'es-ES' : 
                      preferences.language === 'fr' ? 'fr-FR' : 
                      preferences.language === 'de' ? 'de-DE' : 'en-US';
      synthRef.current.speak(utterance);
    }
  };

  const toggleSpeech = () => {
    setIsSpeaking(!isSpeaking);
    if (!isSpeaking && messages.length > 0) {
      const lastBotMessage = messages.filter(m => m.type === 'bot').pop();
      if (lastBotMessage) {
        speakText(lastBotMessage.content);
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div className="relative h-[calc(100vh-120px)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
      
      {/* Header */}
      <div className="relative p-6 border-b border-white/20 backdrop-blur-sm bg-white/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bot className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Premium Travel Assistant
              </h2>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Always here to help • Powered by Gemini AI
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              onClick={toggleSpeech}
              className={`p-2 rounded-full transition-all ${
                isSpeaking 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'bg-white/50 text-gray-600 hover:bg-white/70'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Volume2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="relative flex-1 overflow-y-auto p-6 space-y-6 max-h-[50vh]"
        onScroll={handleScroll}
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-4 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <motion.div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                  message.type === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                    : `bg-gradient-to-br ${getCategoryColor(message.category)}`
                }`}
                whileHover={{ scale: 1.05 }}
              >
                {message.type === 'user' ? (
                  <User className="w-6 h-6 text-white" />
                ) : (
                  getCategoryIcon(message.category)
                )}
              </motion.div>

              {/* Message bubble */}
              <motion.div
                className={`max-w-[85%] group relative ${
                  message.type === 'user' ? 'flex flex-col items-end' : ''
                }`}
                whileHover={{ y: -2 }}
              >
                {/* Message content */}
                <div
                  className={`px-6 py-4 rounded-3xl backdrop-blur-sm shadow-xl relative ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-lg'
                      : 'bg-white/80 text-gray-800 border border-white/20 rounded-bl-lg'
                  }`}
                >
                  {/* Decorative elements */}
                  {message.type === 'bot' && (
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20"></div>
                  )}
                  
                  <p className="text-base leading-relaxed">{message.content}</p>
                  
                  {/* Context badges */}
                  {message.context && message.type === 'bot' && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.context.destination && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          <MapPin className="w-3 h-3" />
                          {message.context.destination}
                        </span>
                      )}
                      {message.context.sustainabilityScore && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          <Leaf className="w-3 h-3" />
                          Eco: {message.context.sustainabilityScore}/100
                        </span>
                      )}
                      {message.context.crowdLevel && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          <Users className="w-3 h-3" />
                          {message.context.crowdLevel} crowds
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <p
                  className={`text-xs mt-2 transition-opacity group-hover:opacity-100 ${
                    message.type === 'user' 
                      ? 'text-blue-600' 
                      : 'text-gray-500 opacity-70'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="bg-white/80 px-6 py-4 rounded-3xl rounded-bl-lg shadow-xl border border-white/20">
              <div className="flex gap-2 items-center">
                <span className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-gray-600 text-sm ml-2">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {!shouldAutoScroll && (
        <motion.button
          onClick={() => {
            // Immediately enable auto-scroll and scroll to bottom
            setShouldAutoScroll(true);
            scrollToBottom();
          }}
          className="absolute bottom-24 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg flex items-center justify-center hover:from-blue-600 hover:to-purple-700 transition-all z-10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.button>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="relative px-4 py-3 border-t border-white/20 backdrop-blur-sm bg-white/30">
          <p className="text-xs text-gray-600 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick suggestions:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                onClick={() => handleSuggestionClick(suggestion.text)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 hover:bg-white/80 text-gray-700 text-xs rounded-full transition-all shadow-sm border border-white/30"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="w-3.5 h-3.5 flex items-center justify-center">
                  {suggestion.icon}
                </div>
                <span className="truncate max-w-[120px]">{suggestion.text}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="relative p-6 border-t border-white/20 backdrop-blur-sm bg-white/30">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <motion.button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-2xl transition-all ${
              isListening 
                ? 'bg-red-500 text-white shadow-lg animate-pulse' 
                : 'bg-white/50 text-gray-600 hover:bg-white/70'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </motion.button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening... Speak now" : "Ask me anything about travel..."}
              className="w-full px-5 py-4 bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-gray-800 placeholder-gray-500 transition-all"
              disabled={isTyping}
            />
            {input && (
              <motion.div 
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </motion.div>
            )}
          </div>
          
          <motion.button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline">Send</span>
          </motion.button>
        </form>
        
        <p className="text-xs text-center text-gray-500 mt-3">
          Powered by Google Gemini AI • {preferences.language?.toUpperCase() || 'EN'} mode
        </p>
      </div>
    </div>
  );
};

// Additional icons that might be needed
const CloudSun = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const Compass = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default AdvancedAssistant;