import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BsSend } from "react-icons/bs";
import {
  FaRegCopy,
  FaThumbsUp,
  FaThumbsDown,
  FaExternalLinkAlt,
  FaRobot,
  FaSync,
  FaCheck,
} from "react-icons/fa";
import { Message, AIChatModalProps, LinkCardProps } from "../types/Chatbot"; // Import types

const LinkCard: React.FC<LinkCardProps> = ({ category, links }) => {
  return (
    <div
      className="card p-2 mb-2 shadow-sm"
      style={{
        display: "inline-block",
        width: "200px",
        minHeight: "100px",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "#fff",
        border: "1px solid #e0e0e0",
      }}
    >
      <div className="card-body p-2">
        <h6
          className="card-title mb-2"
          style={{ fontSize: "14px", fontWeight: "bold" }}
        >
          {category}
        </h6>
        {links.map((link, idx) => (
          <a
            key={idx}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="d-flex align-items-center gap-1 text-decoration-none"
            style={{
              color: "#007bff",
              fontSize: "12px",
              wordBreak: "break-all",
              marginBottom: "4px",
              display: "block",
            }}
          >
            <FaExternalLinkAlt className="text-primary" size={12} />
            <span>{link}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

const AIChatModal: React.FC<AIChatModalProps> = ({ show, handleClose }) => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [showAllLinks, setShowAllLinks] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [likedIndex, setLikedIndex] = useState<number | null>(null);
  const [dislikedIndex, setDislikedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { type: "user", text: input }]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Gathering sources..." },
      ]);

      setTimeout(() => {
        const links = {
          "Example 1": ["www.example.com"],
          "Example 2 ": ["www.example.com"],
          "Example 3": ["www.example.com"],
          "Example 4": ["www.example.com"],
          "Example 5": ["www.example.com"],
          "Example 6": ["www.example.com"],
        };
        setMessages((prev) =>
          prev.filter((msg) => msg.text !== "Gathering sources...")
        );
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: `
            1️⃣ AI can automate repetitive tasks. <a href="${links["Example 1"][0]}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline;">Learn more</a><br/>
            2️⃣ AI enhances decision-making with data insights. <a href="${links["Example 2 "][0]}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline;">Learn more</a><br/>
            3️⃣ AI improves customer experience through chatbots. <a href="${links["Example 3"][0]}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline;">Learn more</a><br/>
            4️⃣ AI-driven analytics optimize business operations. <a href="${links["Example 4"][0]}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline;">Learn more</a><br/>
            5️⃣ AI helps in fraud detection and security enhancement. <a href="${links["Example 5"][0]}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline;">Learn more</a><br/>
            6️⃣ AI enables personalized recommendations in e-commerce. <a href="${links["Example 6"][0]}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline;">Learn more</a><br/>
            7️⃣ AI supports predictive maintenance in industries. <a href="${links["Example 1"][0]}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline;">Learn more</a><br/>
            8️⃣ AI-driven automation increases efficiency. <a href="${links["Example 2 "][0]}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline;">Learn more</a>`,
            links: links,
          },
        ]);
        setLoading(false);
      }, 2000);
    }, 1000);
  };

  const refreshSources = () => {
    setLoading(true);
    setTimeout(() => {
      const links = {
        "Example 1": ["www.example.com"],
        "Example 2": ["www.example.com"],
        "Example 3": ["www.example.com"],
        "Example 4": ["www.example.com"],
        "Example 5": ["www.example.com"],
      };
      setMessages((prev) =>
        prev.filter((msg) => msg.text !== "Gathering sources...")
      );
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: `
            1️⃣ AI can automate repetitive tasks. <a href="${links["Example 1"][0]}" target="_blank" rel="noopener noreferrer">Learn more</a><br/>
            2️⃣ AI enhances decision-making with data insights. <a href="${links["Example 2"][0]}" target="_blank" rel="noopener noreferrer">Learn more</a><br/>
            3️⃣ AI improves customer experience through chatbots. <a href="${links["Example 3"][0]}" target="_blank" rel="noopener noreferrer">Learn more</a><br/>
            4️⃣ AI-driven analytics optimize business operations. <a href="${links["Example 4"][0]}" target="_blank" rel="noopener noreferrer">Learn more</a><br/>
            5️⃣ AI helps in fraud detection and security enhancement. <a href="${links["Example 5"][0]}" target="_blank" rel="noopener noreferrer">Learn more</a>`,
          links: links,
        },
      ]);
      setLoading(false);
    }, 2000);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleLike = (index: number) => {
    setLikedIndex(index);
    setDislikedIndex(null);
    setTimeout(() => setLikedIndex(null), 2000);
  };

  const handleDislike = (index: number) => {
    setDislikedIndex(index);
    setLikedIndex(null);
    setTimeout(() => setDislikedIndex(null), 2000);
  };

  return (
    <div
      className={`modal fade ${show ? "show d-block" : ""}`}
      style={{ background: "rgba(0, 0, 0, 0.6)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg rounded-4 border-0 overflow-hidden">
          <div
            className="modal-header bg-gradient text-white rounded-top d-flex justify-content-between align-items-center"
            style={{
              background: "linear-gradient(135deg, #007bff, #6610f2)",
              padding: "12px 20px",
            }}
          >
            <h5 className="modal-title d-flex align-items-center gap-2 text-dark">
              <FaRobot size={28} color="blue" />
              <span>Ask Your Question</span>
            </h5>
            <button
              className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "30px",
                height: "30px",
                fontSize: "18px",
                fontWeight: "bold",
              }}
              onClick={handleClose}
            >
              ×
            </button>
          </div>

          <div
            className="modal-body p-4"
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              scrollbarWidth: "none",
            }}
          >
            <div className="">
              {messages.map((msg, index) =>
                msg.type === "bot" ? (
                  <div
                    key={index}
                    className="message p-3 rounded shadow-sm bg-light text-dark"
                    style={{ marginBottom: "10px" }}
                  >
                    <p
                      className="mb-0"
                      style={{
                        whiteSpace: "pre-line",
                        fontSize: "14px",
                        fontWeight: "normal",
                        lineHeight: "1.4",
                      }}
                      dangerouslySetInnerHTML={{ __html: msg.text }}
                    />
                    <div className="d-flex justify-content-between mt-3">
                      <button
                        className="btn btn-light border shadow-sm d-flex align-items-center gap-2"
                        onClick={() => copyToClipboard(msg.text, index)}
                      >
                        {copiedIndex === index ? (
                          <FaCheck className="text-primary" />
                        ) : (
                          <FaRegCopy />
                        )}
                      </button>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-light border shadow-sm d-flex align-items-center gap-2"
                          onClick={() => handleLike(index)}
                        >
                          <FaThumbsUp
                            className={
                              likedIndex === index ? "text-success" : ""
                            }
                          />
                        </button>
                        <button
                          className="btn btn-light border shadow-sm d-flex align-items-center gap-2"
                          onClick={() => handleDislike(index)}
                        >
                          <FaThumbsDown
                            className={
                              dislikedIndex === index ? "text-danger" : ""
                            }
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent:
                        msg.type === "user" ? "flex-end" : "flex-start",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor:
                          msg.type === "user" ? "#007bff" : "#f1f1f1",
                        color: msg.type === "user" ? "white" : "black",
                        padding: "10px 15px",
                        borderRadius: "15px",
                        maxWidth: "75%",
                        textAlign: "left",
                        wordWrap: "break-word",
                        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                )
              )}
              <div ref={messagesEndRef} />

              {/* Render link cards outside the message */}
              {messages.length > 0 &&
                messages[messages.length - 1].type === "bot" &&
                messages[messages.length - 1].links && (
                  <div className="mt-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted" style={{ fontSize: "14px" }}>
                        Answer based on the following sources:
                      </span>
                      <button
                        className="btn btn-link p-0"
                        onClick={refreshSources}
                        style={{ color: "#666" }}
                        disabled
                      >
                        <FaSync size={16} />
                      </button>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {Object.entries(
                        showAllLinks
                          ? messages[messages.length - 1].links
                          : Object.fromEntries(
                              Object.entries(
                                messages[messages.length - 1].links
                              ).slice(0, 3)
                            )
                      ).map(([category, links], idx) => (
                        <LinkCard key={idx} category={category} links={links} />
                      ))}
                      {Object.keys(messages[messages.length - 1].links).length >
                        3 && (
                        <button
                          className="btn btn-link text-muted p-0 align-self-center"
                          style={{ fontSize: "12px" }}
                          onClick={() => setShowAllLinks(!showAllLinks)}
                        >
                          {showAllLinks
                            ? "Show less"
                            : `Show all (${
                                Object.keys(messages[messages.length - 1].links)
                                  .length
                              })`}
                        </button>
                      )}
                    </div>
                  </div>
                )}
            </div>

            {loading && (
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  height: "8px",
                  backgroundColor: "rgb(226, 232, 240)",
                  borderRadius: "4px",
                  marginTop: "10px",
                }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgb(108, 91, 255), rgb(73, 69, 255), rgb(108, 91, 255), transparent)",
                    position: "absolute",
                    width: "75%",
                    height: "100%",
                    borderRadius: "12px",
                    transform: `translateX(${progress}%) translateZ(0px)`,
                    transition: "transform 0.1s linear",
                  }}
                ></div>
              </div>
            )}
          </div>

          <div
            className="modal-footer bg-white rounded-bottom p-3"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px",
            }}
          >
            <input
              type="text"
              className="form-control shadow-sm"
              placeholder="Ask your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              style={{
                flex: "1",
                backgroundColor: "#f0f8ff",
                color: "#333",
                border: "2px solid #007bff",
                borderRadius: "20px",
                padding: "10px",
              }}
            />
            <button
              className="btn btn-primary d-flex align-items-center justify-content-center shadow-sm"
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "50%",
                marginLeft: "auto",
              }}
              onClick={sendMessage}
            >
              <BsSend size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AskAIButton: React.FC = () => {
  const [show, setShow] = useState<boolean>(false);
  return (
    <>
      <button
        className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-lg"
        onClick={() => setShow(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        Ask AI
      </button>
      <AIChatModal show={show} handleClose={() => setShow(false)} />
    </>
  );
};

export default AskAIButton;