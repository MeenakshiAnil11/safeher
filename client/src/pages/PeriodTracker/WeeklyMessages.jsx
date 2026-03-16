import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserHeader from "../../components/UserHeader";
import api from "../../services/api";

export default function WeeklyMessages() {
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(null);
  const [weeklyMessage, setWeeklyMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [animationClass, setAnimationClass] = useState("");

  // Load current pregnancy week and weekly message on component mount
  useEffect(() => {
    loadCurrentWeek();
  }, []);

  useEffect(() => {
    if (currentWeek) {
      loadWeeklyMessage(currentWeek);
    }
  }, [currentWeek]);

  const loadCurrentWeek = async () => {
    try {
      const response = await api.get('/pregnancy/current-week');
      setCurrentWeek(response.data.currentWeek || 12); // Default to week 12 if not found
    } catch (error) {
      console.error('Error loading current week:', error);
      setCurrentWeek(12); // Fallback to week 12
    }
  };

  const loadWeeklyMessage = async (week) => {
    try {
      setLoading(true);
      const response = await api.get(`/pregnancy/weekly-message?week=${week}`);
      setWeeklyMessage(response.data.message || generateMockMessage(week));
      
      // Trigger animation after a short delay
      setTimeout(() => {
        setShowMessage(true);
        setAnimationClass("animate-fadeInUp");
      }, 300);
    } catch (error) {
      console.error('Error loading weekly message:', error);
      setWeeklyMessage(generateMockMessage(week));
      setShowMessage(true);
      setAnimationClass("animate-fadeInUp");
    } finally {
      setLoading(false);
    }
  };

  const generateMockMessage = (week) => {
    const messages = {
      1: {
        title: "Welcome to Your Journey!",
        message: "Congratulations on beginning this beautiful journey! Your body is already working miracles to nurture new life. Take time to rest and listen to what your body needs.",
        emoji: "🌟",
        color: "from-pink-400 to-rose-400",
        tip: "Start taking prenatal vitamins and schedule your first prenatal appointment."
      },
      2: {
        title: "Early Changes",
        message: "You might start noticing subtle changes in your body. Trust the process and be gentle with yourself during this incredible transformation.",
        emoji: "🌱",
        color: "from-green-400 to-emerald-400",
        tip: "Stay hydrated and eat small, frequent meals to help with any nausea."
      },
      3: {
        title: "Growing Strong",
        message: "Your baby's major organs are forming rapidly. This is a critical time for development, so prioritize your health and well-being.",
        emoji: "💪",
        color: "from-blue-400 to-cyan-400",
        tip: "Avoid alcohol, smoking, and limit caffeine to support healthy development."
      },
      12: {
        title: "End of First Trimester",
        message: "You've reached a major milestone! The risk of miscarriage significantly decreases, and you might start feeling more energetic soon.",
        emoji: "🎉",
        color: "from-purple-400 to-indigo-400",
        tip: "Consider sharing your news with family and friends if you haven't already."
      },
      20: {
        title: "Halfway There!",
        message: "You're halfway through your pregnancy! Your baby is growing stronger every day, and you might start feeling those precious first kicks.",
        emoji: "👶",
        color: "from-yellow-400 to-orange-400",
        tip: "Start thinking about baby names and begin planning your nursery."
      },
      28: {
        title: "Third Trimester Begins",
        message: "Welcome to the final stretch! Your baby is getting bigger and stronger. Take time to rest and prepare for the exciting arrival ahead.",
        emoji: "🤰",
        color: "from-pink-400 to-purple-400",
        tip: "Pack your hospital bag and finalize your birth plan."
      },
      36: {
        title: "Almost Ready",
        message: "Your baby is nearly ready to meet the world! These final weeks are about preparation and anticipation. Trust your body and your instincts.",
        emoji: "✨",
        color: "from-indigo-400 to-purple-400",
        tip: "Have your hospital bag ready and keep your healthcare provider's number handy."
      }
    };

    return messages[week] || {
      title: `Week ${week} Support`,
      message: "You're doing an amazing job nurturing your little one. Every week brings new developments and milestones. Trust yourself and your body's incredible ability to grow life.",
      emoji: "💕",
      color: "from-pink-400 to-purple-400",
      tip: "Stay connected with your healthcare provider and trust your instincts."
    };
  };

  const refreshMessage = () => {
    setShowMessage(false);
    setAnimationClass("");
    setTimeout(() => {
      loadWeeklyMessage(currentWeek);
    }, 300);
  };

  const getWeekCategory = (week) => {
    if (week <= 12) return "First Trimester";
    if (week <= 26) return "Second Trimester";
    return "Third Trimester";
  };

  const getWeekCategoryColor = (week) => {
    if (week <= 12) return "bg-pink-100 text-pink-800 border-pink-200";
    if (week <= 26) return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-purple-100 text-purple-800 border-purple-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <UserHeader />
      
      <div className="container mx-auto px-4 py-8" style={{ marginTop: '80px' }}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 font-serif">
            Weekly Emotional Support
          </h1>
          <p className="text-gray-600 text-lg">
            Personalized messages to uplift and guide you through each week
          </p>
          <div className="mt-4 inline-block px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full text-sm font-semibold">
            💕 You're doing amazing, mama!
          </div>
        </div>

        {/* Current Week Info */}
        {currentWeek && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-center">
                <div className="text-6xl mb-4">🤰</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Week {currentWeek}
                </h2>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getWeekCategoryColor(currentWeek)}`}>
                  {getWeekCategory(currentWeek)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Message Card */}
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your weekly message...</p>
            </div>
          ) : weeklyMessage && (
            <div className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 ${animationClass}`}>
              {/* Message Header */}
              <div className={`bg-gradient-to-r ${weeklyMessage.color} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl">{weeklyMessage.emoji}</span>
                    <div>
                      <h3 className="text-xl font-bold">{weeklyMessage.title}</h3>
                      <p className="text-sm opacity-90">Week {currentWeek} • {getWeekCategory(currentWeek)}</p>
                    </div>
                  </div>
                  <button
                    onClick={refreshMessage}
                    className="text-white hover:text-gray-200 transition-colors duration-300"
                    title="Refresh message"
                  >
                    🔄
                  </button>
                </div>
              </div>

              {/* Message Content */}
              <div className="p-6">
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {weeklyMessage.message}
                  </p>
                </div>

                {/* Weekly Tip */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-600 text-xl">💡</span>
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-1">This Week's Tip</h4>
                      <p className="text-yellow-700 text-sm">{weeklyMessage.tip}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Support Cards */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Emotional Support */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className="text-4xl mb-3">💝</div>
                <h3 className="font-bold text-gray-800 mb-2">Emotional Support</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Remember, it's okay to feel overwhelmed. Your emotions are valid and important.
                </p>
                <button className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-300">
                  Get Support
                </button>
              </div>
            </div>

            {/* Self Care */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className="text-4xl mb-3">🧘</div>
                <h3 className="font-bold text-gray-800 mb-2">Self Care</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Take time for yourself. A happy, healthy mama means a happy, healthy baby.
                </p>
                <button className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-300">
                  Self Care Tips
                </button>
              </div>
            </div>

            {/* Community */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className="text-4xl mb-3">👥</div>
                <h3 className="font-bold text-gray-800 mb-2">Community</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Connect with other expecting mothers and share your journey.
                </p>
                <button className="bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-300">
                  Join Community
                </button>
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

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
