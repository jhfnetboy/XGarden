import { useState, useEffect, useRef } from "react";
import { GeminiAPIProvider } from "./providers/GeminiAPIProvider";
import { AIProvider } from "./providers/AIProvider";
import ReactMarkdown from "react-markdown";
import "./App.css";

// A simple SVG spinner component for the loading indicator
const LoadingSpinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-gray-500"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

// 4. New type for messages, including a timestamp
type Message = {
  author: "user" | "ai";
  text: string;
  timestamp: number;
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("Not Initialized");
  const [isKeyNeeded, setIsKeyNeeded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const providerRef = useRef<AIProvider | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 2. Load messages from storage on initial mount
  useEffect(() => {
    chrome.storage.local.get(["chatHistory"], (result) => {
      if (result.chatHistory) {
        setMessages(result.chatHistory);
      }
    });
  }, []);

  // 2. Save messages to storage whenever they change
  useEffect(() => {
    // We check messages.length to avoid overwriting stored history with an empty array on initial load
    if (messages.length > 0) {
      chrome.storage.local.set({ chatHistory: messages });
    }
  }, [messages]);

  useEffect(scrollToBottom, [messages, isLoading]);

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  const handleMaximize = () => {
    const url = chrome.runtime.getURL("index.html");
    chrome.tabs.create({ url });
  };

  // 3. Function to clear chat history
  const handleClearHistory = () => {
    if (
      confirm(
        "Are you sure you want to clear the entire chat history? This cannot be undone.",
      )
    ) {
      setMessages([]);
      chrome.storage.local.remove(["chatHistory"]);
    }
  };

  useEffect(() => {
    async function initializeProvider() {
      setStatus("Initializing...");
      setIsKeyNeeded(false);
      providerRef.current = new GeminiAPIProvider();
      try {
        await providerRef.current.initialize();
        setStatus("Initialized. Ready to chat.");
        providerRef.current.onResponse((responseText) => {
          setIsLoading(false);
          const aiMessage: Message = {
            author: "ai",
            text: responseText,
            timestamp: Date.now(),
          };
          setMessages((prevMessages) => [...prevMessages, aiMessage]);
        });
      } catch (error) {
        const errorMessage = (error as Error).message;
        setStatus(`Error: ${errorMessage}`);
        if (errorMessage.includes("API Key is not set")) {
          setIsKeyNeeded(true);
        }
      }
    }
    initializeProvider();
    return () => {
      providerRef.current?.cleanup();
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !providerRef.current || isKeyNeeded || isLoading)
      return;
    const userMessage: Message = {
      author: "user" as const,
      text: input,
      timestamp: Date.now(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    try {
      await providerRef.current.sendMessage(input);
    } catch (error) {
      setStatus(`Error sending: ${(error as Error).message}`);
      setIsLoading(false);
    }
    setInput("");
  };

  if (isKeyNeeded) {
    return (
      <div className="p-4 w-[400px] h-[200px] flex flex-col justify-center items-center bg-white text-center">
        <h1 className="text-xl font-bold mb-2 text-gray-800">
          API Key Required
        </h1>
        <p className="text-gray-600 mb-4">
          Please set your Gemini API key in the options page to begin.
        </p>
        <button
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          onClick={openOptionsPage}
        >
          Open Settings
        </button>
      </div>
    );
  }

  return (
    // 1. Removed fixed width and height, using screen height for full-page view
    <div className="p-4 w-full h-full flex flex-col bg-white">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold text-gray-800">3000World AI Game</h1>
        <div className="flex items-center space-x-2">
          {/* 3. Clear History Button */}
          <button
            onClick={handleClearHistory}
            title="Clear History"
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
          <button
            onClick={handleMaximize}
            title="Open in new tab"
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 1v4m0 0h-4m4 0l-5-5"
              />
            </svg>
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-4">Status: {status}</p>
      <div className="flex-grow overflow-y-auto border rounded-md p-2 mb-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 flex ${msg.author === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`prose inline-block p-2 rounded-lg max-w-xs break-words ${msg.author === "user" ? "bg-blue-500 text-white prose-invert" : "bg-gray-200 text-gray-800"}`}
            >
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="mb-2 flex justify-start">
            <div className="inline-block p-2 rounded-lg bg-gray-200">
              <LoadingSpinner />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex">
        <input
          type="text"
          className="flex-grow border rounded-l-md p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button
          className="bg-blue-600 text-white p-2 rounded-r-md"
          onClick={handleSend}
          disabled={status !== "Initialized. Ready to chat." || isLoading}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
