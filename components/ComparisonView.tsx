import ReactMarkdown from "react-markdown";

type Props = {
  documentText: string;
  simplifiedText: string;
};

export default function ComparisonView({ documentText, simplifiedText }: Props) {
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
        >
          <div className="text-slate-700 dark:text-slate-300 break-words">
            {simplifiedText ? (
              <div className="prose dark:prose-invert markdown-content max-w-none">
                <ReactMarkdown>
                  {simplifiedText}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 italic">Analysis will appear here after asking the AI.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
