import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import "bootstrap/dist/css/bootstrap.min.css";
import { BsSend } from "react-icons/bs";
import styles from "@/styles/Chatbot.module.css";

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.removeItem("chatMessages");
      setMessages([
        {
          sender: "bot",
          text: "Welcome to i2e chatbot, how may I help you?",
          timestamp: getTime(),
        },
      ]);
    } catch (error) {
      console.error("Error initializing chatbot:", error);
    }
  }, []);

  useEffect(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error scrolling chat messages:", error);
    }
  }, [messages]);

  const getTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      const userMessage = { sender: "user", text: input, timestamp: getTime() };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsTyping(true);

      setTimeout(async () => {
        try {
          const botResponseText = await fetchBotResponse(input);
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: botResponseText, timestamp: getTime() },
          ]);
        } catch (error) {
          console.error("Error fetching bot response:", error);
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: "Sorry, something went wrong!", timestamp: getTime() },
          ]);
        } finally {
          setIsTyping(false);
        }
      }, 1000);
    } catch (error) {
      console.error("Error handling user message:", error);
    }
  };

  const fetchBotResponse = async (userInput: string) => {
    try {
      const dummyResponses: { [key: string]: string } = {
        hi: "Hello! How can I assist you today?",
        hello: "Hi there! How can I help?",
        bye: "Goodbye! Have a great day!",
      };
      return dummyResponses[userInput.toLowerCase()] || "I'm sorry, I don't understand that.";
    } catch (error) {
      console.error("Error generating bot response:", error);
      return "Oops! Something went wrong.";
    }
  };

  return (
    <div className="card chatbot-container shadow rounded overflow-hidden" style={{ width: "350px", height: "500px" }}>
      {/* Chat Header */}
      <div className={`card-header text-white d-flex align-items-center justify-content-center gap-2 ${styles["chat-header"]}`}>
        <Image src="/chatbot-icon.png" alt="Chatbot Icon" width={30} height={30} />
        <span className="fw-bold">I2E Chatbot</span>
      </div>

      {/* Chat Body */}
      <div className="card-body d-flex flex-column bg-light" style={{ height: "400px", overflowY: "auto", scrollbarWidth: "none" }}>
        {messages.map((msg, index) => (
          <div key={index} className={`p-2 rounded mb-2 ${msg.sender === "user" ? styles["user-send"] : styles["bot-message"]}`}>
            <span className="d-block">{msg.text}</span>
            <small className={`d-block text-end ${msg.sender === "user" ? "text-white" : "text-muted"}`} style={{ fontSize: "10px" }}>
              {msg.timestamp}
            </small>
          </div>
        ))}
        {isTyping && (
          <div className="d-flex align-items-center gap-1 ms-2">
            <span className="spinner-grow" style={{ width: "6px", height: "6px" }}></span>
            <span className="spinner-grow" style={{ width: "6px", height: "6px" }}></span>
            <span className="spinner-grow" style={{ width: "6px", height: "6px" }}></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Footer */}
      <div className="card-footer d-flex gap-2 bg-white border-top">
        <input
          type="text"
          className={`form-control rounded-pill ${styles["chat-input"]}`}
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <button
          className={`rounded-circle d-flex align-items-center justify-content-center send-button ${styles["send-button"]}`}
          onClick={handleSend}
        >
          <BsSend size={20} color="white" />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
