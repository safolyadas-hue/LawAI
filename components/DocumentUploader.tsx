"use client"
import React, { useState } from "react";

type Props = {
  setDocumentText: (text: string) => void;
  onAnalyze?: () => void;
  title?: string;
  hideAnalyzeButton?: boolean;
};

export default function DocumentUploader({ setDocumentText, onAnalyze, title = "Upload Legal Document", hideAnalyzeButton = false }: Props) {
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setDocumentText(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith(".txt") || file.name.endsWith(".md"))) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setDocumentText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <section
      className="w-full mx-auto flex flex-col items-center justify-center p-8 md:p-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-950"
      aria-labelledby="upload-heading"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <h2 id="upload-heading" className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">
        {title}
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-2 text-center max-w-lg">
        {fileName ? `Selected: ${fileName}` : "Drag and drop your .txt or .md file here, or select a document to instantly translate complex clauses into plain, accessible language."}
      </p>
      <p className="text-slate-500 dark:text-slate-500 italic text-sm mb-6 text-center max-w-lg">
        Please note: Uploaded documents are sent to Google's Gemini API for analysis. Do not upload documents containing sensitive personal data.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <label
          htmlFor="file-upload"
          className="cursor-pointer px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-950"
        >
          <span>Browse Files</span>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            accept=".txt,.md"
            onChange={handleFileChange}
            className="sr-only"
            aria-label="Upload a document for analysis"
          />
        </label>
        {!hideAnalyzeButton && (
          <button
            type="button"
            onClick={onAnalyze}
            className="px-6 py-3 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus-within:ring-offset-slate-950 transition-colors"
            aria-label="Upload and analyze the selected document"
          >
            Upload & Analyze
          </button>
        )}
      </div>
    </section>
  );
}
