// src/types/Chatbot.ts

/** Defines the structure of a chat message */
export interface Message {
    type: "user" | "bot"; // Defines who sent the message
    text: string; // The content of the message
    links?: Record<string, string[]>; // Optional: Category names as keys, arrays of links as values
  }
  
  /** Defines the props for AIChatModal component */
  export interface AIChatModalProps {
    show: boolean; // Controls modal visibility
    handleClose: () => void; // Function to close the modal
  }
  
  /** Defines the props for LinkCard component */
  export interface LinkCardProps {
    category: string; // Category name for the links
    links: string[]; // Array of URLs
  }
  