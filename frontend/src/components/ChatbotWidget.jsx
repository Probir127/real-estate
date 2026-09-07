import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaRobot, FaTimes, FaPaperPlane, FaMagic,
  FaMinus, FaRedo, FaBuilding, FaChevronRight
} from 'react-icons/fa';
import { chatApi } from '../api/client';
import './ChatbotWidget.css';

const QUICK_PROMPTS = [
  'Show luxury homes in Gulshan',
  '3-bed flats for rent in Dhanmondi',
  'How do home loans and EMI work?',
  'What is 1 Crore BDT in Lakhs?'
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I am Zennor AI, your intelligent real estate advisor for Bangladesh. Ask me about verified homes for sale or rent in Gulshan, Banani, Dhanmondi, or mortgage & pricing details!',
      properties: []
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await chatApi.sendMessage(text, history);

      if (res.data?.success) {
        const botMsg = {
          id: Date.now() + 1,
          role: 'assistant',
          content: res.data.reply,
          properties: res.data.suggested_properties || []
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('Could not get answer');
      }
    } catch {
      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'I am currently browsing our live listings. You can explore verified homes in Gulshan, Banani, and Uttara directly from the search page, or ask about mortgage and area rates!',
        properties: []
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        content: 'Chat refreshed. What kind of property or location are you looking for?',
        properties: []
      }
    ]);
  };

  return (
    <div className="z-chatbot-root">
      {/* ── 1. Floating Action Launcher Button ─ */}
      {!isOpen && (
        <motion.button
          className="z-chatbot-launcher"
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open Zennor AI Chatbot"
        >
          <div className="z-chatbot-launcher__pulse" />
          <span className="z-chatbot-launcher__icon">
            <FaRobot />
          </span>
          <span className="z-chatbot-launcher__tooltip">
            <FaMagic className="text-gold" /> Ask Zennor AI
          </span>
        </motion.button>
      )}

      {/* ── 2. Chat Window ───────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`z-chatbot-window ${isMinimized ? 'minimized' : ''}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="z-chatbot-header">
              <div className="z-chatbot-header__info">
                <div className="z-chatbot-avatar">
                  <FaRobot />
                  <span className="z-chatbot-avatar__status" />
                </div>
                <div>
                  <h3 className="z-chatbot-title">
                    Zennor <span>AI Advisor</span>
                  </h3>
                  <p className="z-chatbot-status">Online • Powered by Llama 3.1</p>
                </div>
              </div>
              <div className="z-chatbot-header__actions">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Clear conversation"
                  aria-label="Clear chat"
                  className="z-chatbot-hbtn"
                >
                  <FaRedo />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? 'Expand' : 'Minimize'}
                  aria-label="Minimize chat"
                  className="z-chatbot-hbtn"
                >
                  <FaMinus />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  aria-label="Close chat"
                  className="z-chatbot-hbtn"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Body */}
            {!isMinimized && (
              <>
                <div className="z-chatbot-messages">
                  {messages.map((m) => (
                    <div key={m.id} className={`z-chat-msg ${m.role}`}>
                      {m.role === 'assistant' && (
                        <div className="z-chat-msg__bot-avatar">
                          <FaRobot />
                        </div>
                      )}
                      <div className="z-chat-msg__content">
                        <p>{m.content}</p>

                        {/* Suggested Properties previews */}
                        {m.properties && m.properties.length > 0 && (
                          <div className="z-chat-props">
                            <span className="z-chat-props__label">
                              <FaBuilding /> Matching Verified Listings:
                            </span>
                            {m.properties.map((p) => (
                              <Link
                                key={p.id}
                                to={`/properties/${p.id}`}
                                className="z-chat-prop-chip"
                                onClick={() => setIsOpen(false)}
                              >
                                <div className="z-chat-prop-chip__title">
                                  {p.title} ({p.city})
                                </div>
                                <div className="z-chat-prop-chip__price">
                                  {p.price_formatted} <FaChevronRight />
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="z-chat-msg assistant">
                      <div className="z-chat-msg__bot-avatar">
                        <FaRobot />
                      </div>
                      <div className="z-chat-msg__content z-chat-msg__loading">
                        <span className="dot" />
                        <span className="dot" />
                        <span className="dot" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts */}
                {messages.length <= 2 && (
                  <div className="z-chatbot-quick-prompts">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        className="z-chatbot-quick-btn"
                        onClick={() => handleSend(prompt)}
                        disabled={loading}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Footer Input */}
                <form
                  className="z-chatbot-footer"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ask about properties, prices, areas, mortgage..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={loading}
                    className="z-chatbot-input"
                  />
                  <button
                    type="submit"
                    className="z-chatbot-send-btn"
                    disabled={!inputMessage.trim() || loading}
                    aria-label="Send message"
                  >
                    <FaPaperPlane />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
