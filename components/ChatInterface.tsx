"use client"

import { useState } from "react";

type Props = {
  documentText: string;
  setSimplifiedText: (text: string) => void;
};

export default function ChatInterface({ documentText, setSimplifiedText }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);

    const fullPrompt = documentText 
      ? `Question: ${query}\n\nDocument Context:\n${documentText}`
      : query;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          query: fullPrompt, 
          documentText
        }),
      });

      if (!res.ok) throw new Error("Failed to analyze");
      
      const data = await res.json();
      setSimplifiedText(data.simplified_text);
      setQuery("");
    } catch (error) {
      setSimplifiedText("Sorry, an error occurred while analyzing the document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="shrink-0 sticky bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] z-20 transition-colors duration-200"
      aria-label="Chat with AI Assistant"
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
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
