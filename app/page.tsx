"use client";

import { useState } from "react";
import DocumentUploader from "@/components/DocumentUploader";
import ComparisonView from "@/components/ComparisonView";
import ChatInterface from "@/components/ChatInterface";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  const [documentText, setDocumentText] = useState("");
  const [simplifiedText, setSimplifiedText] = useState("");

  const handleAnalyze = async () => {
    if (!documentText) return;
    try {
      const res = await fetch("/.netlify/functions/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: `Please summarize and analyze this legal document. Highlight any risks.\n\nDocument:\n${documentText}` 
        }),
      });
      const data = await res.json();
      if (data.simplified_text) {
        setSimplifiedText(data.simplified_text);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Header */}
      <header className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 px-6 z-30 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="bg-indigo-600 dark:bg-indigo-500 text-white p-1.5 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </span>
            AI Legal Assistant
          </h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-h-0 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-8 pb-12">
        {/* Upload Section */}
        <section className="flex flex-col gap-2">
          <DocumentUploader setDocumentText={setDocumentText} onAnalyze={handleAnalyze} />
        </section>

        {/* Comparison Section */}
        <section className="flex flex-col gap-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Document Analysis
          </h3>
          <ComparisonView documentText={documentText} simplifiedText={simplifiedText} />
        </section>
      </main>

      {/* Sticky Chat at Bottom */}
      <ChatInterface documentText={documentText} setSimplifiedText={setSimplifiedText} />
    </div>
  );
}
