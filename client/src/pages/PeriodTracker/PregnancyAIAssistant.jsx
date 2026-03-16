import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../../services/api";
import { getPregnancyAnswer } from "../../services/pregnancyChatService";
import "./PregnancyAIAssistant.css";

const CATEGORY_SUGGESTIONS = {
  Nutrition: ["What should I eat this week?", "How much water should I drink daily?"],
  Symptoms: ["Is dizziness normal during pregnancy?", "How can I manage morning sickness?"],
  Exercise: ["What exercises are safe during pregnancy?", "Is walking good in pregnancy?"],
  Sleep: ["How much sleep is recommended?", "How can I improve pregnancy sleep?"],
  "Baby Growth": ["What is my baby's development this week?", "How big is my baby now?"],
  "Doctor Visits": ["How often should I do prenatal checkups?", "What warning signs need urgent care?"],
};

const ALL_SUGGESTIONS = [
  "What should I eat this week?",
  "Is dizziness normal during pregnancy?",
  "What exercises are safe during pregnancy?",
  "How much sleep is recommended?",
  "What is my baby's development this week?",
];

export default function PregnancyAIAssistant({ currentWeek = 20 }) {
  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Nutrition");
  const [healthData, setHealthData] = useState({});
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "ai",
      text: "Hello! I'm your AI Pregnancy Assistant. Ask me about symptoms, nutrition, baby growth, sleep, and maternal wellness.",
      confidence: 90,
    },
  ]);
  const [voiceListening, setVoiceListening] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const loadHealthContext = async () => {
      try {
        const response = await api.get("/pregnancy/logs?limit=1");
        const latest = Array.isArray(response.data?.logs) ? response.data.logs[0] : null;
        setHealthData(latest || {});
      } catch (error) {
        console.error("Failed to load health context for AI chat:", error);
      }
    };
    loadHealthContext();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typing]);

  const visibleSuggestions = useMemo(
    () => CATEGORY_SUGGESTIONS[activeCategory] || ALL_SUGGESTIONS,
    [activeCategory]
  );

  const sendQuestion = async (questionText) => {
    const trimmed = String(questionText || "").trim();
    if (!trimmed) return;

    const userMessage = { id: `${Date.now()}-u`, role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 700));
    const answer = getPregnancyAnswer(trimmed, currentWeek, healthData);
    const aiMessage = {
      id: `${Date.now()}-ai`,
      role: "ai",
      text: answer,
      confidence: 90,
    };
    setMessages((prev) => [...prev, aiMessage]);
    setTyping(false);
  };

  const onSubmitMessage = async (event) => {
    event.preventDefault();
    await sendQuestion(message);
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => setVoiceListening(true);
      recognitionRef.current.onend = () => setVoiceListening(false);
      recognitionRef.current.onerror = () => setVoiceListening(false);
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript || "";
        setMessage(transcript);
      };
    }

    recognitionRef.current.start();
  };

  return (
    <section className="preg-ai-chat-page">
      <article className="preg-ai-chat-shell">
        <div className="preg-ai-chat-history">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`preg-ai-bubble-row ${msg.role === "user" ? "user" : "ai"}`}
            >
              {msg.role === "ai" ? <div className="preg-ai-bot-avatar">🤖</div> : null}
              <div className={`preg-ai-bubble ${msg.role}`}>
                {msg.text}
                {msg.role === "ai" ? (
                  <div className="preg-ai-confidence">AI Confidence: {msg.confidence || 90}%</div>
                ) : null}
              </div>
            </div>
          ))}
          {typing ? (
            <div className="preg-ai-bubble-row ai">
              <div className="preg-ai-bot-avatar">🤖</div>
              <div className="preg-ai-bubble ai typing">AI is typing...</div>
            </div>
          ) : null}
          <div ref={chatEndRef} />
        </div>

        <div className="preg-ai-suggestions">
          <div className="preg-ai-categories">
            {Object.keys(CATEGORY_SUGGESTIONS).map((category) => (
              <button
                key={category}
                type="button"
                className={activeCategory === category ? "active" : ""}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <p>Quick suggestions:</p>
          <div className="preg-ai-suggestion-grid">
            {visibleSuggestions.map((item) => (
              <button key={item} type="button" onClick={() => sendQuestion(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <form className="preg-ai-input-row" onSubmit={onSubmitMessage}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask me anything about pregnancy..."
          />
          <button
            type="button"
            className={`preg-ai-voice-btn ${voiceListening ? "listening" : ""}`}
            aria-label="Voice input"
            onClick={startVoiceInput}
          >
            🎤
          </button>
          <button type="submit" aria-label="Send message">
            ✈
          </button>
        </form>
      </article>

      <footer className="preg-ai-disclaimer">
        <strong>🩺 Medical Disclaimer:</strong> This AI assistant provides general pregnancy
        information and should not replace professional medical advice. Always consult your
        healthcare provider.
      </footer>
    </section>
  );
}
