import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "@/styles/Chatbot.module.css";
import { BsSend } from "react-icons/bs";

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
      // Reset chat and add default welcome message on page reload
      localStorage.removeItem("chatMessages");
      setMessages([
        {
          sender: "bot",
          text: "Welcome to i2e chatbot, how may I help you?",
          timestamp: getTime(),
        },
      ]);
    } catch (error) {
      console.error("Error initializing chat:", error);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      const userMessage = {
        sender: "user",
        text: input,
        timestamp: getTime(),
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setIsTyping(true);

      setTimeout(async () => {
        try {
          const botResponseText = await fetchBotResponse(input);
          const botMessage = {
            sender: "bot",
            text: botResponseText,
            timestamp: getTime(),
          };

          setMessages((prevMessages) => [...prevMessages, botMessage]);
        } catch (error) {
          console.error("Error fetching bot response:", error);
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              sender: "bot",
              text: "Sorry, I encountered an error.",
              timestamp: getTime(),
            },
          ]);
        } finally {
          setIsTyping(false);
        }
      }, 1000);
    } catch (error) {
      console.error("Error handling send:", error);
    }
  };

  const fetchBotResponse = async (userInput: string) => {
    try {
      return new Promise<string>((resolve) => {
        setTimeout(() => {
          const dummyResponses: { [key: string]: string } = {
            hi: "Hello! How can I assist you today?",
            hello: "Hi there! How can I help?",
            "how are you": "I'm just a bot, but I'm functioning well!",
            "what is your name": "I'm your AI chatbot!",
            bye: "Goodbye! Have a great day!",
            "who created you":
              "I was created by a developer using React and Next.js!",
            "what can you do":
              "I can answer simple questions, store messages, and chat with you!",
            "tell me a joke":
              "Why don’t skeletons fight each other? They don’t have the guts!",
          };

          resolve(
            dummyResponses[userInput.toLowerCase()] ||
              "I'm sorry, I don't understand that."
          );
        }, 1000);
      });
    } catch (error) {
      console.error("Error in bot response generation:", error);
      return "Oops! Something went wrong.";
    }
  };

  return (
    <div className={styles.chatbotContainer}>
      {/* Chat Header */}
      <div className={styles.chatHeader}>
        <img
          src="/chatbot-icon.png"
          alt="Chatbot Icon"
          className={styles.botIcon}
        />
        <span>I2E Chatbot</span>
      </div>

      {/* Chat Body */}
      <div className={styles.chatBody}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.message} ${
              msg.sender === "user" ? styles.user : styles.bot
            }`}
          >
            <span className={styles.messageText}>{msg.text}</span>
            <span
              className={`${styles.timestamp} ${
                msg.sender === "user" ? styles.userTimestamp : styles.botTimestamp
              }`}
            >
              {msg.timestamp}
            </span>
          </div>
        ))}
        
        {/* Typing Indicator appears just below the last bot message */}
        {isTyping && (
          <div className={styles.typingIndicator}>
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Footer */}
      <div className={styles.chatFooter}>
        <input
          type="text"
          className={styles.chatInput}
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <button className={styles.sendButton} onClick={handleSend}>
          <BsSend size={20} />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
