import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import UserHeader from "../../components/UserHeader";
import api from "../../services/api";

export default function PregnancyChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);

  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async () => {
    try {
      const response = await api.get('/pregnancy/chat/history');
      setChatHistory(response.data.chatHistory || []);
      
      // Initialize with welcome message if no history
      if (response.data.chatHistory?.length === 0) {
        const welcomeMessage = {
          id: Date.now(),
          type: 'ai',
          message: "Hello! I'm your AI Pregnancy Assistant. I'm here to help answer your questions about pregnancy, provide emotional support, and share helpful information. Remember, I'm not a substitute for professional medical advice - always consult your healthcare provider for medical concerns. How can I help you today?",
          timestamp: new Date(),
          isWelcome: true
        };
        setMessages([welcomeMessage]);
      } else {
        setMessages(response.data.chatHistory || []);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Show welcome message on error
      const welcomeMessage = {
        id: Date.now(),
        type: 'ai',
        message: "Hello! I'm your AI Pregnancy Assistant. I'm here to help answer your questions about pregnancy, provide emotional support, and share helpful information. Remember, I'm not a substitute for professional medical advice - always consult your healthcare provider for medical concerns. How can I help you today?",
        timestamp: new Date(),
        isWelcome: true
      };
      setMessages([welcomeMessage]);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: inputMessage.trim(),
      timestamp: new Date()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);
    setIsTyping(true);

    try {
      const response = await api.post('/pregnancy/chat', {
        message: inputMessage.trim(),
        userId: localStorage.getItem('userId') // Assuming userId is stored in localStorage
      });

      // Simulate typing delay for better UX
      setTimeout(() => {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          message: response.data.aiResponse,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
        setLoading(false);
      }, 1500);

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      setLoading(false);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        message: "I'm sorry, I'm having trouble responding right now. Please try again in a moment, or consult your healthcare provider for urgent concerns.",
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = async () => {
    try {
      await api.delete('/pregnancy/chat/history');
      setMessages([]);
      loadChatHistory();
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <UserHeader />
      
      <div className="container mx-auto px-4 py-8" style={{ marginTop: '80px' }}>
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 font-serif">
            AI Pregnancy Assistant
          </h1>
          <p className="text-gray-600 text-lg">
            Your personal pregnancy companion for questions and support
          </p>
          <div className="mt-4 inline-block px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full text-sm font-semibold">
            🤖 Powered by AI • Always consult your healthcare provider for medical advice
          </div>
        </div>

        {/* Chat Container */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-pink-400 to-purple-400 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Pregnancy Assistant</h3>
                    <p className="text-sm opacity-90">Always here to help</p>
                  </div>
                </div>
                <button
                  onClick={clearChat}
                  className="text-white hover:text-gray-200 transition-colors duration-300"
                  title="Clear chat history"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white'
                        : msg.isError
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : msg.isWelcome
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-xs mt-2 ${
                      msg.type === 'user' ? 'text-white opacity-70' : 'text-gray-500'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">AI is typing...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-3">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your pregnancy journey..."
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  rows="2"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !inputMessage.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed"
                >
                  {loading ? "⏳" : "📤"}
                </button>
              </div>
              
              {/* Quick Questions */}
              <div className="mt-3">
                <p className="text-sm text-gray-500 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "What should I eat this week?",
                    "Is this symptom normal?",
                    "How can I sleep better?",
                    "What exercises are safe?"
                  ].map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputMessage(question)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors duration-300"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Disclaimer */}
        <div className="max-w-4xl mx-auto mt-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <span className="text-yellow-600 text-xl">⚠️</span>
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">Medical Disclaimer</h4>
                <p className="text-sm text-yellow-700">
                  This AI assistant provides general information and support only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult your healthcare provider for medical concerns, especially if you experience severe symptoms or complications.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white py-3 px-8 rounded-xl font-semibold transition-all duration-300">
                📚 View Resources
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm mt-8">
          <p>Developed by Meenakshi Anil | MCA Mini Project 2025</p>
        </div>
      </div>
    </div>
  );
}
