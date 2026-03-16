import React, { useEffect, useMemo, useRef, useState } from "react";
import { getPartnerAIResponse } from "../services/partnerAIEngine";
import "./PartnerAIAssistant.css";

const SUGGESTIONS = [
  "How can I support my partner emotionally?",
  "What should fathers prepare before delivery?",
  "How can I help with pregnancy back pain?",
  "What should I do in week 20?",
];

export default function PartnerAIAssistant({
  isOpen = false,
  onClose,
  pregnancyWeek = 20,
  healthData = {},
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [voiceListening, setVoiceListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const chatEndRef = useRef(null);

  const trimesterLabel = useMemo(() => {
    const week = Number(pregnancyWeek) || 20;
    if (week <= 12) return "first";
    if (week <= 27) return "second";
    return "third";
  }, [pregnancyWeek]);

  useEffect(() => {
    if (!isOpen) return;
    setMessages((prev) => {
      if (prev.length) return prev;
      return [
        {
          type: "ai",
          title: `Week ${pregnancyWeek} Support Context`,
          tips: [
            `Your partner is in week ${pregnancyWeek} (${trimesterLabel} trimester). Ask me how to support her emotionally, physically, and practically.`,
          ],
        },
      ];
    });
  }, [isOpen, pregnancyWeek, trimesterLabel]);

  useEffect(() => {
    if (!isOpen) return;
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) return;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [isOpen]);

  useEffect(
    () => () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsSpeaking(false);
      setIsPaused(false);
    },
    []
  );

  const sendMessage = (text = input) => {
    const question = String(text || "").trim();
    if (!question) return;
    const response = getPartnerAIResponse(question, pregnancyWeek, healthData);
    setMessages((prev) => [
      ...prev,
      { type: "user", text: question },
      { type: "ai", title: response.title, tips: response.tips },
    ]);
    setInput("");
  };

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (!recognitionRef.current) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.onstart = () => setVoiceListening(true);
      rec.onend = () => setVoiceListening(false);
      rec.onerror = () => setVoiceListening(false);
      rec.onresult = (event) => {
        const transcript = event?.results?.[0]?.[0]?.transcript || "";
        setInput(transcript);
      };
      recognitionRef.current = rec;
    }
    recognitionRef.current.start();
  };

  const readResponse = (tips = []) => {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    const text = Array.isArray(tips) ? tips.join(". ") : String(tips || "");
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 1;
    speech.pitch = 1;
    speech.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    speech.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    speech.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utteranceRef.current = speech;
    window.speechSynthesis.speak(speech);
  };

  const pauseResponse = () => {
    if (!window.speechSynthesis) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resumeResponse = () => {
    if (!window.speechSynthesis) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stopResponse = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    utteranceRef.current = null;
  };

  if (!isOpen) return null;

  return (
    <div className="partner-ai-modal-overlay" onClick={onClose}>
      <div className="partner-ai-modal" onClick={(event) => event.stopPropagation()}>
        <header className="partner-ai-head">
          <div>
            <h3>Partner AI Assistant</h3>
            <p>Week {pregnancyWeek} support guidance</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close assistant">
            ✕
          </button>
        </header>

        <div className="partner-ai-suggestions">
          {SUGGESTIONS.map((item) => (
            <button key={item} type="button" onClick={() => setInput(item)}>
              {item}
            </button>
          ))}
        </div>

        <div className="partner-ai-chat">
          {messages.map((message, index) =>
            message.type === "user" ? (
              <div className="partner-ai-row user" key={`${message.type}-${index}-${message.text}`}>
                <div className="partner-ai-bubble user">{message.text}</div>
              </div>
            ) : (
              <div className="partner-ai-row ai" key={`${message.type}-${index}-${message.title || "ai"}`}>
                <div className="partner-ai-bubble ai">
                  {message.title ? <strong>{message.title}</strong> : null}
                  <ul>
                    {(message.tips || []).map((tip) => (
                      <li key={`${index}-${tip}`}>{tip}</li>
                    ))}
                  </ul>
                  <div className="partner-ai-response-actions">
                    <button type="button" onClick={() => readResponse(message.tips)}>
                      🔊 Read Response
                    </button>
                    {isSpeaking ? (
                      isPaused ? (
                        <button type="button" onClick={resumeResponse}>
                          ▶ Resume
                        </button>
                      ) : (
                        <button type="button" onClick={pauseResponse}>
                          ⏸ Pause
                        </button>
                      )
                    ) : null}
                    {isSpeaking || isPaused ? (
                      <button type="button" onClick={stopResponse}>
                        ⏹ Stop
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          )}
          <div ref={chatEndRef} />
        </div>

        <footer className="partner-ai-input-row">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask how to support your partner this week..."
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                sendMessage();
              }
            }}
          />
          <button
            type="button"
            className={`partner-ai-voice-btn ${voiceListening ? "listening" : ""}`}
            onClick={startVoice}
            aria-label="Record voice"
          >
            🎤
          </button>
          <button type="button" className="partner-ai-send-btn" onClick={() => sendMessage()}>
            Send
          </button>
        </footer>
      </div>
    </div>
  );
}
