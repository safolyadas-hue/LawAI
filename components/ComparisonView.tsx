import ReactMarkdown from "react-markdown";
import { useRef, useEffect } from "react";

type Props = {
  documentText: string;
  simplifiedText: string;
  chatHistory?: {question: string; answer: string}[];
};

export default function ComparisonView({ documentText, simplifiedText, chatHistory = [] }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, simplifiedText]);
  return (
    <section
      className="w-full flex flex-col md:flex-row gap-6 h-[60vh] md:h-[70vh] min-h-0"
      aria-label="Document comparison"
    >
      {/* Left Panel */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-200">
        <header className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-5 py-4 transition-colors duration-200 shrink-0">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">Original Document</h2>
        </header>
        <div
          className="p-6 overflow-y-auto flex-1 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          tabIndex={0}
          role="region"
          aria-label="Original Document Content"
        >
          <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
            {documentText ? (
              <p>{documentText}</p>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 italic">No document uploaded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-200">
        <header className="bg-indigo-50 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/50 px-5 py-4 transition-colors duration-200 shrink-0">
          <h2 className="font-semibold text-indigo-900 dark:text-indigo-300">AI Simplified</h2>
        </header>
        <div
          className="p-6 overflow-y-auto flex-1 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          tabIndex={0}
          role="region"
          aria-label="AI Simplified Content"
          ref={scrollRef}
        >
          <div className="text-slate-700 dark:text-slate-300 break-words flex flex-col gap-6">
            {simplifiedText ? (
              <div className="prose dark:prose-invert markdown-content max-w-none">
                <ReactMarkdown>
                  {simplifiedText}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 italic">Analysis will appear here after asking the AI.</p>
            )}

            {chatHistory.length > 0 && (
              <div className="flex flex-col gap-4 mt-4 border-t border-slate-200 dark:border-slate-800 pt-6">
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
          </div>
        </div>
      </div>
    </section>
  );
}
