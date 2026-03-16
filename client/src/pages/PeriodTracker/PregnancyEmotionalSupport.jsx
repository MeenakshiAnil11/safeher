import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import getPregnancyWeekContent from "../../data/pregnancyWeekContent";
import { emotionalSupportResponses } from "../../data/emotionalSupportResponses";
import { communitySupportPosts } from "../../data/communitySupportPosts";
import { pregnancyAudios } from "../../data/pregnancyVideos";
import { getMentalHealthAdvice } from "../../services/pregnancyPersonalizationService";
import { selectMediaForWeek } from "../../utils/videoUtils";
import PregnancyVideoSection from "../../components/PregnancyVideoSection";
import "./PregnancyEmotionalSupport.css";

const SUPPORT_CARDS = [
  {
    icon: "🧘",
    title: "Managing Stress",
    points: [
      "Practice daily meditation for 10-15 minutes",
      "Take short breaks throughout the day",
      "Connect with loved ones regularly",
      "Engage in gentle physical activity",
    ],
  },
  {
    icon: "👩",
    title: "Self-Care Ideas",
    points: [
      "Take warm (not hot) baths",
      "Listen to calming music",
      "Read books or watch favorite shows",
      "Practice prenatal massage",
    ],
  },
  {
    icon: "😴",
    title: "Sleep Better",
    points: [
      "Maintain consistent sleep schedule",
      "Use pregnancy pillows for comfort",
      "Limit screen time before bed",
      "Create a relaxing bedtime routine",
    ],
  },
  {
    icon: "🌈",
    title: "Mood Support",
    points: [
      "Journal your feelings and experiences",
      "Join pregnancy support groups",
      "Talk to your partner about concerns",
      "Seek professional help if needed",
    ],
  },
];

const MOODS = ["😊 Great", "🙂 Good", "😐 Okay", "😔 Low", "😟 Struggling"];
const MOOD_VALUE = {
  "😊 Great": 5,
  "🙂 Good": 4,
  "😐 Okay": 3,
  "😔 Low": 2,
  "😟 Struggling": 1,
};
const CHALLENGE_DAYS = [
  "Day 1 - Gratitude journal",
  "Day 2 - Nature walk",
  "Day 3 - 10-minute meditation",
  "Day 4 - Hydration check-in",
  "Day 5 - Positive affirmation practice",
  "Day 6 - Phone-free evening routine",
  "Day 7 - Connect with support system",
];

const GENERIC_SUPPORT_REPLIES = [
  "Thank you for sharing. You are not alone, and your feelings are valid.",
  "I hear you. Let us take this one step at a time with gentle self-care.",
  "Thanks for opening up. Small actions today can create emotional relief.",
  "You are doing your best in a big life phase. That matters.",
];

const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const scoreKeywordMatch = (text, keyword) => {
  const key = normalizeText(keyword);
  if (!key) return 0;
  if (text.includes(key)) return key.length + 4;
  const words = key.split(" ");
  if (words.every((word) => text.includes(word))) return words.length + 1;
  return 0;
};

export default function PregnancyEmotionalSupport({ currentWeek }) {
  const navigate = useNavigate();
  const [supportCards, setSupportCards] = useState(
    getPregnancyWeekContent(currentWeek || 20).emotional.supportCards
  );
  const [warningSigns, setWarningSigns] = useState([
    "Persistent sadness or anxiety",
    "Difficulty sleeping or eating",
    "Loss of interest in normal activities",
    "Excessive worry about your baby",
  ]);
  const [selectedMood, setSelectedMood] = useState("");
  const [moodHistory, setMoodHistory] = useState([]);
  const [challengeState, setChallengeState] = useState({});
  const [chatInput, setChatInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [failedAudio, setFailedAudio] = useState({});
  const [voiceListening, setVoiceListening] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "ai", text: "Hi, I am here to support your emotional wellness. How are you feeling today?" },
  ]);
  const [chatTyping, setChatTyping] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const loadWellness = async () => {
      try {
        const week = currentWeek || 20;
        const dynamic = getPregnancyWeekContent(week);
        setSupportCards(dynamic.emotional.supportCards);
        setWarningSigns(dynamic.emotional.warningSigns);
      } catch (error) {
        console.error("Failed to load emotional support wellness data:", error);
      }
    };

    loadWellness();
  }, [currentWeek]);

  useEffect(() => {
    try {
      const savedMood = JSON.parse(localStorage.getItem("pregMoodHistory") || "[]");
      const savedChallenge = JSON.parse(localStorage.getItem("pregWellnessChallenge") || "{}");
      setMoodHistory(Array.isArray(savedMood) ? savedMood : []);
      setChallengeState(savedChallenge || {});
    } catch {
      setMoodHistory([]);
      setChallengeState({});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pregMoodHistory", JSON.stringify(moodHistory));
  }, [moodHistory]);

  useEffect(() => {
    localStorage.setItem("pregWellnessChallenge", JSON.stringify(challengeState));
  }, [challengeState]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatTyping]);

  useEffect(
    () => () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      }
    },
    []
  );

  const moodChartData = useMemo(() => {
    return moodHistory
      .slice(-7)
      .map((entry) => ({
        date: new Date(entry.date).toLocaleDateString("en-US", { weekday: "short" }),
        moodValue: entry.value,
      }));
  }, [moodHistory]);

  const lowMoodAlert = useMemo(() => {
    const recent = moodHistory.slice(-7);
    const lowCount = recent.filter((item) => item.mood === "😔 Low" || item.mood === "😟 Struggling").length;
    return lowCount >= 3;
  }, [moodHistory]);
  const moodForAdvice = selectedMood || moodHistory[moodHistory.length - 1]?.mood || "😐 Okay";
  const personalizedMentalAdvice = useMemo(
    () => getMentalHealthAdvice(moodForAdvice),
    [moodForAdvice]
  );
  const guidedAudios = useMemo(
    () => selectMediaForWeek(pregnancyAudios?.emotional || {}, currentWeek || 20),
    [currentWeek]
  );

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setMoodHistory((prev) => [
      ...prev,
      { mood, value: MOOD_VALUE[mood] || 3, date: new Date().toISOString() },
    ]);
  };

  const sendSupportMessage = async (input) => {
    const question = String(input || "").trim();
    if (!question) return;
    setChatMessages((prev) => [...prev, { role: "user", text: question }]);
    setChatInput("");
    setChatTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 600));
    const normalizedInput = normalizeText(question);
    const scoredMatches = emotionalSupportResponses
      .map((item) => ({
        answer: item.answer,
        score: Math.max(...item.keywords.map((key) => scoreKeywordMatch(normalizedInput, key))),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    let answer = scoredMatches[0]?.answer || "";

    if (!answer) {
      if (/(hello|hi|hey)\b/.test(normalizedInput)) {
        answer = "Hi, I am here with you. How are you feeling emotionally today?";
      } else if (/(not feeling well|not good|feel bad|very upset|broken|hopeless)/.test(normalizedInput)) {
        answer = `I am really sorry you are feeling this way. ${personalizedMentalAdvice.advice[0]} If these feelings stay intense, please reach out to your healthcare provider or a trusted person now.`;
      } else if (/(thank you|thanks)/.test(normalizedInput)) {
        answer = "You are welcome. I am always here to support you whenever you need to talk.";
      } else {
        const index = Math.abs(normalizedInput.length + (currentWeek || 20)) % GENERIC_SUPPORT_REPLIES.length;
        answer = `${GENERIC_SUPPORT_REPLIES[index]} ${personalizedMentalAdvice.advice[0]}`;
      }
    }

    setChatMessages((prev) => {
      const lastAi = [...prev].reverse().find((msg) => msg.role === "ai")?.text;
      const finalAnswer =
        lastAi && lastAi === answer
          ? `${answer} You can also try this now: ${personalizedMentalAdvice.advice[1] || personalizedMentalAdvice.advice[0]}`
          : answer;
      return [...prev, { role: "ai", text: finalAnswer }];
    });
    setChatTyping(false);
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Voice input is not supported in this browser. Please type your message.",
        },
      ]);
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event?.results?.[0]?.[0]?.transcript || "";
        if (!transcript.trim()) return;
        setChatInput(transcript);
        sendSupportMessage(transcript);
      };

      recognition.onerror = () => {
        setVoiceListening(false);
      };

      recognition.onend = () => {
        setVoiceListening(false);
      };

      recognitionRef.current = recognition;
    }

    try {
      setVoiceListening(true);
      recognitionRef.current.start();
    } catch (error) {
      setVoiceListening(false);
    }
  };

  return (
    <section className="preg-em-page">
      <article className="preg-em-hero">
        <div className="hero-icon">♡</div>
        <div className="preg-em-hero-content">
          <h2>You're Doing Amazing! 💕</h2>
          <p>
            Pregnancy is a beautiful journey, but it's okay to have mixed emotions. Your feelings
            are valid, whether you're excited, anxious, tired, or all of the above. Remember to be
            kind to yourself and take time for self-care. You're growing a miracle!
          </p>
          <small>"Taking care of yourself doesn't mean me first, it means me too." - L.R. Knost</small>
        </div>
        <button
          type="button"
          className="chatbot-button"
          onClick={() => setIsChatOpen(true)}
        >
          💬 Emotional Chatbot
        </button>
      </article>

      <section className="preg-em-grid">
        {supportCards.map((item, idx) => (
          <article className="preg-em-card" key={item.key || `${item.title}-${idx}`}>
            <h3>
              <span>{item.icon}</span>
              {item.title}
            </h3>
            <ul>
              {item.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="preg-em-mood">
        <h3>☺ How Are You Feeling Today?</h3>
        <div className="mood-grid">
          {MOODS.map((mood) => (
            <button
              key={mood}
              type="button"
              className={selectedMood === mood ? "active" : ""}
              onClick={() => handleMoodSelect(mood)}
            >
              {mood}
            </button>
          ))}
        </div>
      </section>

      <section className="preg-em-card">
        <h3>
          <span>🧠</span>
          Personalized Emotional Guidance
        </h3>
        <ul>
          {personalizedMentalAdvice.advice.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <section className="preg-em-mood-chart">
        <h3>Mood Trend This Week</h3>
        <div className="mood-chart-wrap">
          {moodChartData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={moodChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f2e8ff" />
                <XAxis dataKey="date" />
                <YAxis domain={[1, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="moodValue" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="mood-chart-empty">Select a mood to start tracking your weekly trend.</p>
          )}
        </div>
      </section>

      <section className="preg-em-guided-audio">
        <h3>Guided Relaxation</h3>
        <div className="guided-audio-grid">
          {guidedAudios.map((item) => (
            <article key={item.title} className="audio-card">
              <h4>{item.title}</h4>
              <audio
                controls
                preload="metadata"
                onError={() =>
                  setFailedAudio((prev) => ({
                    ...prev,
                    [item.title]: true,
                  }))
                }
              >
                <source src={item.src} type="audio/mpeg" />
              </audio>
              <a className="audio-fallback-link" href={item.src} target="_blank" rel="noopener noreferrer">
                ▶ Open audio in new tab
              </a>
              {failedAudio[item.title] ? (
                <small className="audio-fallback-note">
                  Audio could not be loaded in browser player. Use the link above.
                </small>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="preg-em-guided-audio">
        <PregnancyVideoSection
          category="emotional"
          week={currentWeek || 20}
          title="🎥 Emotional Wellness Videos"
        />
      </section>

      <section className="preg-em-challenge">
        <h3>7-Day Pregnancy Wellness Challenge</h3>
        <div className="challenge-list">
          {CHALLENGE_DAYS.map((item) => (
            <label key={item}>
              <input
                type="checkbox"
                checked={Boolean(challengeState[item])}
                onChange={() =>
                  setChallengeState((prev) => ({
                    ...prev,
                    [item]: !prev[item],
                  }))
                }
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="preg-em-relax">
        <h3>Quick Relaxation Techniques</h3>
        <article>
          <h4>☀ Morning Gratitude</h4>
          <p>
            Start your day by thinking of three things you're grateful for. This simple practice can
            improve your mood and perspective.
          </p>
        </article>
        <article>
          <h4>♡ Positive Affirmations</h4>
          <p>"I am strong and capable."</p>
          <p>"My body knows how to nurture my baby."</p>
          <p>"I trust the process of pregnancy and birth."</p>
        </article>
        <article>
          <h4>☾ Evening Wind-Down</h4>
          <p>
            Create a calming evening routine: dim lights, gentle music, and deep breathing to
            prepare for restful sleep.
          </p>
        </article>
      </section>

      <section className="preg-em-help">
        <h3>♡ When to Seek Professional Help</h3>
        <p>
          {warningSigns.join(", ")}. Please reach out to your healthcare provider immediately if you
          notice these persist. Perinatal mental health is important, and help is available.
        </p>
        {lowMoodAlert ? (
          <div className="professional-alert">
            You may benefit from professional support. Consider contacting a healthcare provider.
          </div>
        ) : null}
        <small>24/7 Crisis Hotline: 988 (Suicide & Crisis Lifeline)</small>
      </section>

      <section className="preg-em-community">
        <div className="community-icon">🤝</div>
        <h3>Connect with Other Moms</h3>
        <p>
          Join our community to share experiences, ask questions, and find support from other
          expecting mothers.
        </p>
        <div className="community-feed">
          {communitySupportPosts.map((post) => (
            <article key={post.id}>
              <strong>{post.user}</strong>
              <p>{post.message}</p>
              <span>{post.mood}</span>
            </article>
          ))}
        </div>
        <button type="button" onClick={() => navigate("/pregnancy/community")}>Join Community</button>
      </section>

      {isChatOpen ? (
        <div
          className="chatbot-modal-overlay"
          onClick={() => setIsChatOpen(false)}
        >
          <div
            className="chatbot-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="close-btn"
              onClick={() => setIsChatOpen(false)}
              aria-label="Close emotional chatbot"
            >
              ✖
            </button>
            <section className="preg-em-chat preg-em-chat-popup">
              <h3>AI Emotional Support Chat</h3>
              <div className="chat-history">
                {chatMessages.map((msg, idx) => (
                  <div key={`${msg.role}-${idx}`} className={`chat-row ${msg.role}`}>
                    <div className={`chat-bubble ${msg.role}`}>{msg.text}</div>
                  </div>
                ))}
                {chatTyping ? <div className="chat-row ai"><div className="chat-bubble ai">AI is typing...</div></div> : null}
                <div ref={chatEndRef} />
              </div>
              <div className="chat-input-row">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Share what you are feeling..."
                />
                <button
                  type="button"
                  className={`chat-voice-btn ${voiceListening ? "listening" : ""}`}
                  aria-label="Voice input"
                  onClick={startVoiceInput}
                >
                  🎤
                </button>
                <button type="button" onClick={() => sendSupportMessage(chatInput)}>
                  Send
                </button>
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </section>
  );
}
