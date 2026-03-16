import React, { useMemo, useRef, useState } from "react";
import menopauseAIKnowledge from "../data/menopauseAIKnowledge";

const SUGGESTIONS = [
  "Why am I having hot flashes?",
  "How can I improve sleep?",
  "What foods reduce menopause symptoms?",
];

const fallbackReply =
  "I can help with perimenopause wellness guidance. Try asking about hot flashes, sleep, mood swings, stress, nutrition, or exercise.";

const getCoachReply = (question) => {
  const q = String(question || "").toLowerCase();
  const matched = menopauseAIKnowledge.find((entry) => entry.keywords.some((word) => q.includes(word)));
  return matched ? matched.advice : fallbackReply;
};

export default function AIHealthCoach() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi, I am your AI Health Coach. Ask me about perimenopause symptoms, sleep, mood, stress, or lifestyle support.",
    },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const chatEndRef = useRef(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const startVoiceInput = () => {
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setInput(transcript);
    };
    recognition.start();
  };

  const sendMessage = (raw) => {
    const text = (raw ?? input).trim();
    if (!text) return;
    const reply = getCoachReply(text);
    setMessages((prev) => [...prev, { role: "user", text }, { role: "ai", text: reply }]);
    setInput("");
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 40);
  };

  const messageList = useMemo(() => messages, [messages]);

  return (
    <div className="bg-gradient-to-br from-white to-lavender-50 rounded-2xl p-5 border border-lavender-100 shadow-sm">
      <h3 className="text-2xl font-bold text-gray-800 mb-1">AI Health Coach</h3>
      <p className="text-gray-600 mb-4">Text + voice conversational support for perimenopause wellness.</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {SUGGESTIONS.map((item) => (
          <button
            key={item}
            onClick={() => sendMessage(item)}
            className="text-sm px-3 py-2 rounded-full bg-lavender-100 text-lavender-700 hover:bg-lavender-200"
          >
            {item}
          </button>
        ))}
      </div>

      <div className="h-80 overflow-y-auto bg-white border border-gray-200 rounded-xl p-3 mb-4">
        {messageList.map((msg, idx) => (
          <div key={`${msg.role}-${idx}`} className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                msg.role === "user" ? "bg-lavender-500 text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Ask your perimenopause question..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
        />
        <button
          onClick={startVoiceInput}
          className={`px-3 py-2 rounded-lg ${listening ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}
          title="Voice input"
        >
          🎤
        </button>
        <button
          onClick={() => sendMessage()}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-lavender-400 to-pink-400 text-white font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  );
}
