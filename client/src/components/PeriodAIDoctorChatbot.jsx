import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaMicrophone, FaPaperPlane, FaRobot, FaTimes, FaVolumeUp } from "react-icons/fa";
import { getMenstrualAIResponse } from "../services/menstrualAIChatService";
import "./PeriodAIDoctorChatbot.css";

const SUGGESTED_QUESTIONS = [
  "Why do periods cause cramps?",
  "What is ovulation?",
  "How to reduce PMS symptoms?",
  "Is exercise safe during periods?",
];

export default function PeriodAIDoctorChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState(null);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);
  const [cycleContext, setCycleContext] = useState({ phase: "", cycleDay: null });
  const recognitionRef = useRef(null);
  const recognitionActiveRef = useRef(false);
  const chatBottomRef = useRef(null);
  const activeSpeechIdRef = useRef(null);

  const createMessage = (role, text) => ({
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
  });

  const syncActiveSpeechId = (id) => {
    activeSpeechIdRef.current = id;
    setActiveSpeechId(id);
  };

  const stopSpeech = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    syncActiveSpeechId(null);
    setIsSpeechPaused(false);
  };

  const toggleSpeechPause = () => {
    if (!window.speechSynthesis) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsSpeechPaused(false);
      return;
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsSpeechPaused(true);
    }
  };

  const closeChatbot = () => {
    stopSpeech();
    if (recognitionRef.current && recognitionActiveRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // Ignore cleanup stop failures.
      }
    }
    recognitionActiveRef.current = false;
    setIsListening(false);
    setIsOpen(false);
  };

  const phaseLabel = useMemo(() => {
    const map = {
      menstrual: "Menstrual",
      follicular: "Follicular",
      ovulation: "Ovulation",
      luteal: "Luteal",
    };
    return map[cycleContext.phase] || "Unknown";
  }, [cycleContext.phase]);

  useEffect(() => {
    if (!isOpen) return;
    if (messages.length) return;

    const intro =
      cycleContext.phase && cycleContext.cycleDay
        ? `Hi, I am your AI Doctor assistant. I can help with cycle health. You are currently in ${phaseLabel} phase (Day ${cycleContext.cycleDay}).`
        : "Hi, I am your AI Doctor assistant. Ask me about menstruation, PMS, ovulation, cramps, and reproductive health.";

    setMessages([createMessage("ai", intro)]);
  }, [isOpen, messages.length, cycleContext.phase, cycleContext.cycleDay, phaseLabel]);

  useEffect(() => {
    const loadCycleContext = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await fetch("/api/periods/current-phase", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data?.phase) {
          setCycleContext({
            phase: data.phase,
            cycleDay: (data.daysSinceLastPeriod || 0) + 1,
          });
        }
      } catch (error) {
        // Keep chatbot available even when context API is unavailable.
      }
    };
    loadCycleContext();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(
    () => () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current && recognitionActiveRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Ignore cleanup stop failures.
        }
      }
      recognitionActiveRef.current = false;
    },
    []
  );

  const speakText = (text, speechId = null) => {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    window.speechSynthesis.cancel();
    const nextSpeechId = speechId || `speech-${Date.now()}`;
    syncActiveSpeechId(nextSpeechId);
    setIsSpeechPaused(false);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => {
      if (activeSpeechIdRef.current === nextSpeechId) {
        syncActiveSpeechId(null);
        setIsSpeechPaused(false);
      }
    };
    utterance.onerror = () => {
      if (activeSpeechIdRef.current === nextSpeechId) {
        syncActiveSpeechId(null);
        setIsSpeechPaused(false);
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = (draft = inputText) => {
    const question = String(draft || "").trim();
    if (!question) return;

    const aiText = getMenstrualAIResponse(question, cycleContext);
    const userMessage = createMessage("user", question);
    const aiMessage = createMessage("ai", aiText);
    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setInputText("");
    speakText(aiText, aiMessage.id);
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Voice input is not supported in this browser. Please type your question.",
        },
      ]);
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.onstart = () => {
        recognitionActiveRef.current = true;
        setIsListening(true);
      };
      recognition.onend = () => {
        recognitionActiveRef.current = false;
        setIsListening(false);
      };
      recognition.onerror = () => {
        recognitionActiveRef.current = false;
        setIsListening(false);
      };
      recognition.onresult = (event) => {
        const transcript = event?.results?.[0]?.[0]?.transcript || "";
        setInputText(transcript);
      };
      recognitionRef.current = recognition;
    }

    if (recognitionActiveRef.current || isListening) return;

    try {
      recognitionRef.current.start();
    } catch (error) {
      if (error?.name !== "InvalidStateError") {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: "I could not start voice input right now. Please try again." },
        ]);
      }
    }
  };

  return (
    <>
      <button type="button" className="period-ai-fab" onClick={() => setIsOpen(true)}>
        <FaRobot /> Ask AI Doctor
      </button>

      {isOpen && (
        <div className="period-ai-overlay" onClick={closeChatbot}>
          <div className="period-ai-modal" onClick={(e) => e.stopPropagation()}>
            <header className="period-ai-head">
              <div>
                <h3>AI Doctor Chatbot</h3>
                <p>
                  {cycleContext.phase
                    ? `Context: ${phaseLabel} phase${cycleContext.cycleDay ? ` | Day ${cycleContext.cycleDay}` : ""}`
                    : "Cycle context will be used when available"}
                </p>
              </div>
              <button type="button" onClick={closeChatbot} aria-label="Close chatbot">
                <FaTimes />
              </button>
            </header>

            <div className="period-ai-suggested">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button key={question} type="button" onClick={() => sendMessage(question)}>
                  {question}
                </button>
              ))}
            </div>

            <section className="period-ai-chat">
              {messages.map((msg, index) => (
                <div key={msg.id || `${msg.role}-${index}-${msg.text.slice(0, 12)}`} className={`period-ai-row ${msg.role}`}>
                  <div className={`period-ai-bubble ${msg.role}`}>
                    <p>{msg.text}</p>
                    {msg.role === "ai" && (
                      <div className="period-ai-read-controls">
                        <button
                          type="button"
                          onClick={() => {
                            const isCurrentMessage = activeSpeechId === msg.id;
                            if (isCurrentMessage && (window.speechSynthesis?.speaking || window.speechSynthesis?.paused)) {
                              toggleSpeechPause();
                              return;
                            }
                            speakText(msg.text, msg.id);
                          }}
                        >
                          <FaVolumeUp />{" "}
                          {activeSpeechId === msg.id ? (isSpeechPaused ? "Resume" : "Pause") : "Read Aloud"}
                        </button>
                        {activeSpeechId === msg.id && (
                          <button type="button" className="period-ai-read-stop" onClick={stopSpeech}>
                            Stop
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </section>

            <footer className="period-ai-input-wrap">
              <input
                type="text"
                placeholder="Ask about periods, PMS, ovulation, or pain..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button
                type="button"
                className={`period-ai-voice-btn ${isListening ? "listening" : ""}`}
                onClick={startVoiceInput}
                aria-label="Voice input"
              >
                <FaMicrophone />
              </button>
              <button type="button" className="period-ai-send-btn" onClick={() => sendMessage()}>
                <FaPaperPlane />
              </button>
            </footer>

            <p className="period-ai-disclaimer">
              This AI assistant provides educational information only and does not replace professional medical advice.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
