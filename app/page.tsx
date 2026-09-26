"use client";

import { useState } from "react";
import DocumentUploader from "@/components/DocumentUploader";
import ComparisonView from "@/components/ComparisonView";
import ChatInterface from "@/components/ChatInterface";
import ThemeToggle from "@/components/ThemeToggle";
import { analyzeDocument } from "@/lib/analyzeDocument";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [documentText, setDocumentText] = useState("");
  const [simplifiedText, setSimplifiedText] = useState("");
  const [secondDocumentText, setSecondDocumentText] = useState("");
  const [comparisonResultText, setComparisonResultText] = useState("");
  const [isComparing, setIsComparing] = useState(false);

  const handleAnalyze = async () => {
    if (!documentText) return;
    try {
      const query = `Please summarize and analyze this legal document. Highlight any risks.\n\nDocument:\n${documentText}`;
      const simplified_text = await analyzeDocument(query);
      setSimplifiedText(simplified_text);
    } catch (err) {
      console.error(err);
      setSimplifiedText("Sorry, an error occurred while analyzing the document.");
    }
  };

  const handleCompare = async () => {
    if (!documentText || !secondDocumentText) return;
    setIsComparing(true);
    try {
      const query = `Please compare these two legal documents. Identify key differences, and which document favors the user more, in plain English.\n\nDocument 1:\n${documentText}\n\nDocument 2:\n${secondDocumentText}`;
      const comparison_text = await analyzeDocument(query);
      setComparisonResultText(comparison_text);
    } catch (err) {
      console.error(err);
      setComparisonResultText("Sorry, an error occurred while comparing the documents.");
    } finally {
      setIsComparing(false);
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
      <main id="main-content" className="flex-1 overflow-y-auto min-h-0 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-8 pb-12">
        {/* Upload Section */}
        <section className="flex flex-col gap-6">
          <DocumentUploader setDocumentText={setDocumentText} onAnalyze={handleAnalyze} />
          
          <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-slate-800 pt-6">
            <DocumentUploader 
              setDocumentText={setSecondDocumentText} 
              title="Upload Second Document (For Comparison)"
              hideAnalyzeButton={true}
            />
            {secondDocumentText && documentText && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleCompare}
                  disabled={isComparing}
                  className="px-6 py-3 bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus-within:ring-offset-slate-950"
                >
                  {isComparing ? "Comparing..." : "Compare Documents"}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Comparison Section */}
        <section className="flex flex-col gap-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Document Analysis
          </h3>
          <ComparisonView documentText={documentText} simplifiedText={simplifiedText} />
        </section>

        {/* Document Comparison Result Section */}
        {comparisonResultText && (
          <section className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Comparison Results
            </h3>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 overflow-y-auto min-h-[30vh]">
               <div className="prose dark:prose-invert markdown-content max-w-none">
                 <ReactMarkdown>
                   {comparisonResultText}
                 </ReactMarkdown>
               </div>
            </div>
          </section>
        )}
      </main>

      {/* Sticky Chat at Bottom */}
      <ChatInterface documentText={documentText} simplifiedText={simplifiedText} setSimplifiedText={setSimplifiedText} />
    </div>
  );
}
