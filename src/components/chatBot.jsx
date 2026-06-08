import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import "./style/chatBot.scss";

const ChatBot = () => {
  const token = sessionStorage.getItem("token");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      text: "Hello! How can I assist you today?",
      sender: "bot",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessageText = inputValue.trim();
    const userMessageId = Date.now().toString();

    setMessages((prev) => [
      ...prev,
      { id: userMessageId, text: userMessageText, sender: "user" },
    ]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch(
        "https://tumorhospital.runasp.net/api/ChatBot/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: userMessageText }), // Adjust payload key if your API requires something different (e.g., 'text' or 'prompt')
        },
      );

      if (!response.ok) throw new Error(`HTTP status: ${response.status}`);

      const contentType = response.headers.get("content-type");
      let botResponseText = "";

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        botResponseText = data.reply || data.response || JSON.stringify(data);
      } else {
        botResponseText = await response.text();
      }

      setMessages((prev) => [
        ...prev,
        { id: `bot-${Date.now()}`, text: botResponseText, sender: "bot" },
      ]);
    } catch (err) {
      console.error(err);
      toast.error(`Chat error: ${err.message}`, { toastId: "chat-api-error" });

      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          text: "Sorry, I am having trouble connecting to the server right now.",
          sender: "bot",
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="bot-avatar">🧑‍⚕</div>
        <div className="header-status">
          <h3>MEDAI Assistant</h3>
          <span>Online</span>
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
            <div
              className={`message-bubble ${msg.isError ? "error-bubble" : ""}`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="message-wrapper bot">
            <div className="message-bubble typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form className="chatbot-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type your message here..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isTyping}
        />
        <button type="submit" disabled={!inputValue.trim() || isTyping}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBot;
