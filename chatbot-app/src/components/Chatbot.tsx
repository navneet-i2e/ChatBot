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
    // Reset chat and add default welcome message on page reload
    localStorage.removeItem("chatMessages");
    setMessages([
      {
        sender: "bot",
        text: "Welcome to i2e chatbot, how may I help you?",
        timestamp: getTime(),
      },
    ]);
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

    const newMessages = [
      ...messages,
      { sender: "user", text: input, timestamp: getTime() },
    ];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    setTimeout(async () => {
      const botResponse = await fetchBotResponse(input);
      setMessages([
        ...newMessages,
        { sender: "bot", text: botResponse, timestamp: getTime() },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const fetchBotResponse = async (userInput: string) => {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        const dummyResponses: { [key: string]: string } = {
          hi: "Hello! How can I assist you today?",
          hello: "Hi there! How can I help?",
          "how are you": "I'm just a bot, but I'm functioning well!",
          "what is your name": "I'm your AI chatbot!",
          bye: "Goodbye! Have a great day!",
          "who created you": "I was created by a developer using React and Next.js!",
          "what can you do": "I can answer simple questions, store messages, and chat with you!",
          "tell me a joke": "Why don’t skeletons fight each other? They don’t have the guts!",
          "what is the weather like":
            "I can't fetch real-time weather, but you can check it on a weather website!",
          "what is 2 + 2": "That’s easy! 2 + 2 = 4.",
          "tell me a fun fact":
            "Did you know? Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3000 years old and still perfectly edible!",
          "where are you from": "I exist in the digital world, hosted inside your browser!",
          "what is your purpose": "My purpose is to assist users by providing helpful responses!",
          "do you like humans": "Of course! You created me, after all!",
          "who is the best football player":
            "That's subjective! Some say Messi, others say Ronaldo. What do you think?",
          "what's your favorite color": "I like all colors, but blue is often associated with technology!",
          "can you dance": "I wish I could, but my moves are limited to scrolling text!",
          "how old are you": "I was born when my developer created me, so I guess I'm pretty young!",
          "do you sleep": "Nope, I'm always here whenever you need me!",
          "what is AI": "AI stands for Artificial Intelligence, which enables machines to think and learn like humans!",
          "can you learn": "I don't learn on my own, but my developer can update me to be smarter!",
          "what's your favorite food": "I don’t eat, but I’ve heard pizza is pretty popular!",
          "how do I build a website": "You can use HTML, CSS, and JavaScript to build a website, or frameworks like React and Next.js for advanced features!",
          "who is the CEO of Tesla": "Elon Musk is the CEO of Tesla!",
          "what's the capital of France": "The capital of France is Paris!",
          "who won the last FIFA World Cup": "Argentina won the 2022 FIFA World Cup!",
          "what's the square root of 64": "The square root of 64 is 8!",
          "who is the president of the USA": "As of my last update, it's Joe Biden!",
          "how do I learn JavaScript":
            "You can start by visiting MDN Web Docs, freeCodeCamp, or W3Schools!",
          "what is React": "React is a JavaScript library for building user interfaces, developed by Facebook.",
          "what is Next.js": "Next.js is a React framework that enables server-side rendering and static site generation.",
          "what is i2e": "i2e is a technology-driven company focused on innovation and excellence!",
        };

        resolve(dummyResponses[userInput.toLowerCase()] || "I'm sorry, I don't understand that.");
      }, 1000);
    });
  };

  return (
    <div className={styles.chatbotContainer}>
      {/* Chat Header with Centered Icon and Text */}
      <div className={styles.chatHeader}>
        <img src="/chatbot-icon.png" alt="Chatbot Icon" className={styles.botIcon} />
        <span>i2e Chatbot</span>
      </div>

      {/* Chat Body */}
      <div className={styles.chatBody}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.message} ${msg.sender === "user" ? styles.user : styles.bot}`}
          >
            <span className={styles.messageText}>{msg.text}</span>
            <span className={styles.timestamp}>{msg.timestamp}</span>
          </div>
        ))}
        {isTyping && (
          <div className={styles.typingIndicator}>
            <span>.</span><span>.</span><span>.</span>
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
