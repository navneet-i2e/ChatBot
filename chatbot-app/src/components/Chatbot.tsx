import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BsSend } from "react-icons/bs";
import {
  FaRegCopy,
  FaThumbsUp,
  FaThumbsDown,
  FaExternalLinkAlt,
  FaSync,
  FaCheck,
} from "react-icons/fa";
import { v4 as uuidv4 } from "uuid"; // Import UUID
import Image from "next/image";
import styles from "../styles/Chatbot.module.css";

// Type definitions
interface Message {
  id: string;
  type: "user" | "bot";
  text: string;
  links?: { [key: string]: string[] };
}

interface AIChatModalProps {
  show: boolean;
  handleClose: () => void;
}

interface LinkCardProps {
  category: string;
  links: string[];
}

// LinkCard component to display source links
const LinkCard: React.FC<LinkCardProps> = ({ category, links }) => {
  return (
    <div className={`card p-2 mb-2 shadow-sm ${styles.linkCard}`}>
      <div className="card-body p-2">
        <h6 className={`card-title mb-2 ${styles.linkCategory}`}>
          {category}
        </h6>
        {links.map((link, idx) => (
          <a
            key={idx}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={`d-flex align-items-center gap-1 text-decoration-none ${styles.linkItem}`}
          >
            <FaExternalLinkAlt className="text-primary" size={12} />
            <span>{link}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

// AIChatModal component
const AIChatModal: React.FC<AIChatModalProps> = ({ show, handleClose }) => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [showAllLinks, setShowAllLinks] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedId, setLikedId] = useState<string | null>(null);
  const [dislikedId, setDislikedId] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null); // Session ID state
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Start a new session when the modal is opened
  useEffect(() => {
    if (show) {
      setMessages([]); // Clear previous messages
      const newSessionId = uuidv4(); // Generate a new UUID
      setSessionId(newSessionId);
      console.log(`New session started: ${newSessionId}`); // Optional: for debugging
    }
  }, [show]);

  // Loading progress animation
  useEffect(() => {
    if (loading) {
      let progressValue = 0;
      const interval = setInterval(() => {
        progressValue += 5;
        if (progressValue >= 100) {
          progressValue = 0;
        }
        setProgress(progressValue);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [loading]);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message to the server
  const sendMessage = async (query: string) => {
    if (!query.trim() || !sessionId) {
      console.error("Cannot send message: query is empty or sessionId is not set");
      return;
    }

    const userMessageId = uuidv4();
    setMessages([...messages, { id: userMessageId, type: "user", text: query }]);
    setInput("");
    setLoading(true);
    setLastQuery(query);

    try {
      const response = await fetch("http://localhost:8000/api/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, sessionId }), // Include sessionId
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status} - ${response.statusText}. Details: ${errorText}`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No readable stream available");
      }

      const botMessageId = uuidv4();
      setMessages((prev) => [
        ...prev,
        { id: botMessageId, type: "bot", text: "", links: {} },
      ]);

      let accumulatedText = "";
      const decoder = new TextDecoder();
      let partialJSON = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        partialJSON += chunk;

        const startMarker = '"response": "';
        const startIndex = partialJSON.indexOf(startMarker);

        if (startIndex !== -1) {
          const actualStart = startIndex + startMarker.length;
          const endIndex = partialJSON.lastIndexOf('", "sources":');

          if (endIndex !== -1) {
            accumulatedText = partialJSON.substring(actualStart, endIndex);
          } else {
            accumulatedText = partialJSON.substring(actualStart);
          }

          accumulatedText = accumulatedText
            .replace(/\\n/g, "\n")
            .replace(/\\"/g, '"');

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId ? { ...msg, text: accumulatedText } : msg
            )
          );

          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      }

      try {
        const jsonMatch = partialJSON.match(/\{.*\}/s);
        if (jsonMatch) {
          const jsonData = JSON.parse(jsonMatch[0]);

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? {
                    ...msg,
                    text: jsonData.response,
                    links:
                      jsonData.sources?.reduce((acc: any, url: string) => {
                        acc[url] = [url];
                        return acc;
                      }, {}) || {},
                  }
                : msg
            )
          );
        }
      } catch (error) {
        console.error("Error parsing final JSON:", error);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          type: "bot",
          text: `Sorry, something went wrong! Error: ${(error as Error).message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh the last query
  const handleRefresh = () => {
    if (lastQuery) {
      sendMessage(lastQuery);
    }
  };

  // Copy message text to clipboard
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle like button
  const handleLike = (id: string) => {
    setLikedId(id);
    setDislikedId(null);
    setTimeout(() => setLikedId(null), 2000);
  };

  // Handle dislike button
  const handleDislike = (id: string) => {
    setDislikedId(id);
    setLikedId(null);
    setTimeout(() => setDislikedId(null), 2000);
  };

  return (
    <div
      className={`modal fade ${show ? "show d-block" : ""} ${
        styles.modalOverlay
      }`}
    >
      <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-fullscreen-sm-down">
        <div
          className={`modal-content ${styles.chatModalContent} shadow-lg rounded-4 border-0 overflow-hidden`}
        >
          <div
            className={`modal-header bg-gradient text-white rounded-top d-flex justify-content-between align-items-center ${styles.modalHeader}`}
          >
            <h5 className="modal-title d-flex align-items-center gap-2 text-dark">
              <Image
                src="/chatbot-icon.png"
                alt="Robot"
                width={28}
                height={28}
              />
              <span>Ask Your Question</span>
            </h5>
            <button
              className={`btn btn-light rounded-circle d-flex align-items-center justify-content-center ${styles.closeButton}`}
              onClick={handleClose}
            >
              ×
            </button>
          </div>

          <div className={`modal-body p-4 ${styles.chatModalBody}`}>
            <div>
              {messages.map((msg) =>
                msg.type === "bot" ? (
                  <div
                    key={msg.id}
                    className={`message p-3 rounded shadow-sm bg-light text-dark ${styles.botMessage}`}
                  >
                    <p
                      className={`mb-0 ${styles.botMessageText}`}
                      dangerouslySetInnerHTML={{ __html: msg.text }}
                    />
                    <div className="d-flex justify-content-between mt-3">
                      <button
                        className="btn btn-light border shadow-sm d-flex align-items-center gap-2"
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                      >
                        {copiedId === msg.id ? (
                          <FaCheck className="text-primary" />
                        ) : (
                          <FaRegCopy />
                        )}
                      </button>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-light border shadow-sm d-flex align-items-center gap-2"
                          onClick={() => handleLike(msg.id)}
                        >
                          <FaThumbsUp
                            className={likedId === msg.id ? "text-success" : ""}
                          />
                        </button>
                        <button
                          className="btn btn-light border shadow-sm d-flex align-items-center gap-2"
                          onClick={() => handleDislike(msg.id)}
                        >
                          <FaThumbsDown
                            className={
                              dislikedId === msg.id ? "text-danger" : ""
                            }
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={msg.id}
                    className={styles.userMessageContainer}
                  >
                    <div className={styles.userMessageBubble}>{msg.text}</div>
                  </div>
                )
              )}
              <div ref={messagesEndRef} />
              {messages.length > 0 &&
                messages[messages.length - 1].type === "bot" &&
                messages[messages.length - 1].links &&
                Object.keys(messages[messages.length - 1].links).length > 0 && (
                  <div className="mt-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className={`text-muted ${styles.sourcesText}`}>
                        Answer based on the following sources:
                      </span>
                      <button
                        className={`btn btn-link p-0 ${styles.refreshButton}`}
                        onClick={handleRefresh}
                      >
                        <FaSync size={16} />
                      </button>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {Object.entries(
                        showAllLinks
                          ? messages[messages.length - 1].links!
                          : Object.fromEntries(
                              Object.entries(
                                messages[messages.length - 1].links!
                              ).slice(0, 3)
                            )
                      ).map(([category, links], idx) => (
                        <LinkCard
                          key={idx}
                          category={category}
                          links={links}
                        />
                      ))}
                      {Object.keys(messages[messages.length - 1].links!).length >
                        3 && (
                        <button
                          className={`btn btn-link text-muted p-0 align-self-center ${styles.showAllButton}`}
                          onClick={() => setShowAllLinks(!showAllLinks)}
                        >
                          {showAllLinks
                            ? "Show less"
                            : `Show all (${
                                Object.keys(messages[messages.length - 1].links!)
                                  .length
                              })`}
                        </button>
                      )}
                    </div>
                  </div>
                )}
            </div>

            {loading && (
              <div className={styles.loadingContainer}>
                <div
                  className={styles.loadingBar}
                  style={{
                    transform: `translateX(${progress}%) translateZ(0px)`,
                  }}
                ></div>
              </div>
            )}
          </div>

          <div
            className={`modal-footer bg-white rounded-bottom p-3 ${styles.modalFooter}`}
          >
            <input
              type="text"
              className={`form-control shadow-sm ${styles.inputField}`}
              placeholder="Ask your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            />
            <button
              className={`btn btn-primary d-flex align-items-center justify-content-center shadow-sm ${styles.sendButton}`}
              onClick={() => sendMessage(input)}
            >
              <BsSend size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// AskAIButton component to toggle the modal
const AskAIButton: React.FC = () => {
  const [show, setShow] = useState<boolean>(false);
  return (
    <>
      <button
        className={`btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-lg ${styles.askAIButton}`}
        onClick={() => setShow(true)}
      >
        Ask AI
      </button>
      <AIChatModal show={show} handleClose={() => setShow(false)} />
    </>
  );
};

export default AskAIButton;