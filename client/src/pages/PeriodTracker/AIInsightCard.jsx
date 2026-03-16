import React, { useState, useEffect } from "react";
import api from "../../services/api";
import perimenopauseAIInsights from "../../data/perimenopauseAIInsights";
import { detectPatterns, getStoredLogs } from "../../services/perimenopauseService";

// Soft illustration SVG component
const InsightIllustration = () => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mx-auto mb-4"
  >
    {/* Background circle */}
    <circle
      cx="40"
      cy="40"
      r="35"
      fill="url(#gradient1)"
      opacity="0.1"
    />
    
    {/* Lightbulb body */}
    <path
      d="M40 15C35 15 30 20 30 25C30 30 35 35 40 35C45 35 50 30 50 25C50 20 45 15 40 15Z"
      fill="url(#gradient2)"
    />
    
    {/* Lightbulb base */}
    <rect
      x="35"
      y="35"
      width="10"
      height="8"
      rx="2"
      fill="url(#gradient3)"
    />
    
    {/* Light rays */}
    <path
      d="M25 25L20 20M55 25L60 20M25 35L20 40M55 35L60 40"
      stroke="url(#gradient4)"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.6"
    />
    
    {/* Sparkles */}
    <circle cx="25" cy="20" r="2" fill="url(#gradient5)" opacity="0.8">
      <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="55" cy="20" r="1.5" fill="url(#gradient5)" opacity="0.6">
      <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="30" cy="50" r="1" fill="url(#gradient5)" opacity="0.7">
      <animate attributeName="opacity" values="0.7;0.1;0.7" dur="3s" repeatCount="indefinite" />
    </circle>
    
    {/* Gradient definitions */}
    <defs>
      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
      <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
      <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6b7280" />
        <stop offset="100%" stopColor="#4b5563" />
      </linearGradient>
      <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
      <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
  </svg>
);

export default function AIInsightCard() {
  const [insightData, setInsightData] = useState({
    title: "Today's AI Insight",
    content: "",
    isNew: false,
    lastUpdated: null,
    isLoading: false
  });
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState(null);

  const buildInsightFromTrends = () => {
    const logs = getStoredLogs();
    const warnings = detectPatterns(logs);
    if (!warnings.length) return perimenopauseAIInsights.find((item) => item.key === "stable");
    if (warnings.some((w) => w.toLowerCase().includes("hot flash"))) {
      return perimenopauseAIInsights.find((item) => item.key === "hotFlashIncrease");
    }
    if (warnings.some((w) => w.toLowerCase().includes("sleep"))) {
      return perimenopauseAIInsights.find((item) => item.key === "sleepDrop");
    }
    if (warnings.some((w) => w.toLowerCase().includes("mood"))) {
      return perimenopauseAIInsights.find((item) => item.key === "moodStress");
    }
    return perimenopauseAIInsights.find((item) => item.key === "stable");
  };

  // Fetch insight data from API
  const fetchInsight = async () => {
    try {
      setInsightData(prev => ({ ...prev, isLoading: true }));
      setError(null);
      const localInsight = buildInsightFromTrends();
      const response = await api.get('/perimenopause/insight').catch(() => null);
      const data = response?.data || localInsight || {};
      
      // Check if this is a new insight
      const isNewInsight = !insightData.lastUpdated || 
        new Date(data.timestamp) > new Date(insightData.lastUpdated);
      
      setInsightData({
        title: data.title || "Today's AI Insight",
        content: data.content || "No insight available at the moment.",
        isNew: isNewInsight,
        lastUpdated: data.timestamp || new Date().toISOString(),
        isLoading: false
      });
      
      // Trigger animation for new insights
      if (isNewInsight) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);
      }
      
    } catch (err) {
      console.error('Error fetching insight:', err);
      setError('Failed to load insight');
      
      // Use fallback data
      setInsightData(prev => ({
        ...prev,
        content: prev.content || buildInsightFromTrends()?.content || "No insight available at the moment.",
        title: prev.title || buildInsightFromTrends()?.title || "Today's AI Insight",
        isLoading: false
      }));
    }
  };

  // Regenerate insight
  const regenerateInsight = async () => {
    try {
      setInsightData(prev => ({ ...prev, isLoading: true }));
      setError(null);
      const localInsight = buildInsightFromTrends();
      const response = await api.post('/perimenopause/regenerate').catch(() => null);
      const data = response?.data || localInsight || {};
      
      setInsightData({
        title: data.title || "Today's AI Insight",
        content: data.content || "No insight available at the moment.",
        isNew: true,
        lastUpdated: data.timestamp || new Date().toISOString(),
        isLoading: false
      });
      
      // Trigger animation for regenerated insight
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
      
    } catch (err) {
      console.error('Error regenerating insight:', err);
      setError('Failed to regenerate insight');
      setInsightData(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchInsight();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-lavender-100 to-pink-100 rounded-2xl p-6 shadow-lg border border-lavender-200 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="text-xl mr-2">🤖</span>
          {insightData.title}
        </h3>
        {insightData.isNew && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full animate-pulse">
            New
          </span>
        )}
      </div>

      {/* Illustration */}
      <div className="text-center mb-4">
        <InsightIllustration />
      </div>

      {/* Content */}
      <div className="mb-4">
        <div 
          className={`text-gray-700 text-sm leading-relaxed transition-all duration-500 ${
            isAnimating ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
          }`}
        >
          {insightData.isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-lavender-500"></div>
              <span className="ml-2 text-gray-600">Generating insight...</span>
            </div>
          ) : (
            insightData.content
          )}
        </div>
        
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {insightData.lastUpdated && (
            <span>
              {insightData.isNew ? 'Updated' : 'Last updated'}: {formatDate(insightData.lastUpdated)}
            </span>
          )}
        </div>
        
        <button
          onClick={regenerateInsight}
          disabled={insightData.isLoading}
          className="bg-gradient-to-r from-lavender-400 to-pink-400 hover:from-lavender-500 hover:to-pink-500 text-white py-2 px-4 rounded-lg text-xs font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {insightData.isLoading ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
              Regenerating...
            </span>
          ) : (
            '🔄 Regenerate Tip'
          )}
        </button>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-2 right-2 opacity-20">
        <div className="w-2 h-2 bg-lavender-400 rounded-full animate-ping"></div>
      </div>
      <div className="absolute bottom-2 left-2 opacity-20">
        <div className="w-1 h-1 bg-pink-400 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}
