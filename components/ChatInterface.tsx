"use client"

import { useState, useRef, useEffect } from "react";
import { analyzeDocument } from "@/lib/analyzeDocument";
import ReactMarkdown from "react-markdown";

type Props = {
  documentText: string;
  simplifiedText?: string;
  chatHistory: {question: string; answer: string}[];
  setChatHistory: (history: {question: string; answer: string}[]) => void;
};

export default function ChatInterface({ documentText, simplifiedText, chatHistory, setChatHistory }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setLiveMessage("Loading response...");

    const context = simplifiedText || documentText;
    const fullPrompt = context 
      ? `Question: ${query}\n\nDocument Context:\n${context}`
      : query;

    const currentQuery = query;
    setQuery("");

    try {
      const simplified_text = await analyzeDocument(fullPrompt, documentText);
      setChatHistory([...chatHistory, { question: currentQuery, answer: simplified_text }]);
      setLiveMessage("Response received.");
    } catch (error) {
      setChatHistory([...chatHistory, { question: currentQuery, answer: "Sorry, an error occurred while analyzing the document." }]);
      setLiveMessage("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="shrink-0 sticky bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] z-20 transition-colors duration-200"
      aria-label="Chat with AI Assistant"
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        {chatHistory.length > 0 && (
          <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto mb-2" ref={chatContainerRef}>
            {chatHistory.map((chat, idx) => (
              <div key={idx} className="flex flex-col gap-2 text-sm">
                <div className="self-end bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-100 px-4 py-2 rounded-2xl max-w-[80%]">
                  {chat.question}
                </div>
                <div className="self-start bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-2xl max-w-[80%] prose dark:prose-invert">
                  <ReactMarkdown>{chat.answer}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
        <form
          className="flex gap-3"
          onSubmit={handleSubmit}
        >
          <label htmlFor="chat-input" className="sr-only">
            Ask a question about the document
          </label>
          <input
            id="chat-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full px-6 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner disabled:opacity-50"
            placeholder="Ask a question about the document..."
            aria-label="Ask a question about the document"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-indigo-400 dark:disabled:bg-indigo-800/50 text-white rounded-full px-6 py-3 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex items-center justify-center min-w-[120px]"
            aria-label="Send message"
          >
            <span>{loading ? "Thinking..." : "Ask AI"}</span>
            {!loading && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
