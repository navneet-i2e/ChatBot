// import React, { useState, useEffect, useRef } from "react";
// import Image from "next/image";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { BsSend } from "react-icons/bs";

// interface Message {
//   sender: "user" | "bot";
//   text: string;
//   timestamp: string;
// }

// const Chatbot: React.FC = () => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     localStorage.removeItem("chatMessages");
//     setMessages([
//       {
//         sender: "bot",
//         text: "Welcome to i2e chatbot, how may I help you?",
//         timestamp: getTime(),
//       },
//     ]);
//   }, []);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const getTime = () => {
//     return new Date().toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   const handleSend = async () => {
//     if (!input.trim()) return;
//     const userMessage = { sender: "user", text: input, timestamp: getTime() };
//     setMessages([...messages, userMessage]);
//     setInput("");
//     setIsTyping(true);

//     setTimeout(async () => {
//       const botResponseText = await fetchBotResponse(input);
//       setMessages((prev) => [
//         ...prev,
//         { sender: "bot", text: botResponseText, timestamp: getTime() },
//       ]);
//       setIsTyping(false);
//     }, 1000);
//   };

//   const fetchBotResponse = async (userInput: string) => {
//     const dummyResponses: { [key: string]: string } = {
//       hi: "Hello! How can I assist you today?",
//       hello: "Hi there! How can I help?",
//       bye: "Goodbye! Have a great day!",
//     };
//     return (
//       dummyResponses[userInput.toLowerCase()] ||
//       "I'm sorry, I don't understand that."
//     );
//   };

//   return (
//     <div
//       className="card chatbot-container shadow rounded overflow-hidden"
//       style={{ width: "350px", height: "500px" }}
//     >
//       {/* Chat Header */}
//       <div
//         className="card-header text-white d-flex align-items-center justify-content-center gap-2"
//         style={{
//           background: "#0a2f57",
//           color: "white",
//         }}
//       >
//         <Image
//           src="/chatbot-icon.png"
//           alt="Chatbot Icon"
//           width={30}
//           height={30}
//         />
//         <span className="fw-bold">I2E Chatbot</span>
//       </div>

//       {/* Chat Body */}
//       <div
//         className="card-body d-flex flex-column bg-light"
//         style={{ height: "400px", overflowY: "auto", scrollbarWidth: "none" }}
//       >
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             className={`p-2 rounded mb-2 ${
//               msg.sender === "user"
//                 ? "text-white align-self-end"
//                 : "bg-white text-dark align-self-start border"
//             }`}
//             style={{
//               maxWidth: "75%",
//               background: msg.sender === "user" ? "#5fa2e9" : "white",
//             }}
//           >
//             <span className="d-block">{msg.text}</span>
//             <small
//               className={`d-block text-end ${
//                 msg.sender === "user" ? "text-white" : "text-muted"
//               }`}
//               style={{ fontSize: "10px" }}
//             >
//               {msg.timestamp}
//             </small>
//           </div>
//         ))}
//         {isTyping && (
//           <div className="d-flex align-items-center gap-1 ms-2">
//             <span
//               className="spinner-grow"
//               style={{ width: "6px", height: "6px" }}
//             ></span>
//             <span
//               className="spinner-grow"
//               style={{ width: "6px", height: "6px" }}
//             ></span>
//             <span
//               className="spinner-grow"
//               style={{ width: "6px", height: "6px" }}
//             ></span>
//           </div>
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Chat Footer */}
//       <div className="card-footer d-flex gap-2 bg-white border-top">
//         <input
//           type="text"
//           className="form-control rounded-pill"
//           placeholder="Type your message..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyPress={(e) => e.key === "Enter" && handleSend()}
//         />
//         <button
//           className="rounded-circle d-flex align-items-center justify-content-center"
//           style={{
//             width: "40px",
//             height: "40px",
//             background: "#5fa2e9",
//             border: "2px solid white", // Add white border to the button
//           }}
//           onClick={handleSend}
//         >
//           <BsSend size={20} color="white" /> {/* Set the icon color to white */}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Chatbot;





