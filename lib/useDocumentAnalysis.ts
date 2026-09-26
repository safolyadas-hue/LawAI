import { useState, useCallback } from "react";
import { analyzeDocument } from "./analyzeDocument";

export function useDocumentAnalysis() {
  const [documentText, setDocumentText] = useState("");
  const [simplifiedText, setSimplifiedText] = useState("");
  const [secondDocumentText, setSecondDocumentText] = useState("");
  const [comparisonResultText, setComparisonResultText] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [chatHistory, setChatHistory] = useState<{question: string; answer: string}[]>([]);

  const handleAnalyze = useCallback(async () => {
    if (!documentText) return;
    try {
      const query = `Please summarize and analyze this legal document. Highlight any risks.\n\nDocument:\n${documentText}`;
      const simplified_text = await analyzeDocument(query);
      setSimplifiedText(simplified_text);
    } catch (err) {
      console.error(err);
      setSimplifiedText("Sorry, an error occurred while analyzing the document.");
    }
  }, [documentText]);

  const handleCompare = useCallback(async () => {
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
  }, [documentText, secondDocumentText]);

  return {
    documentText,
    setDocumentText,
    simplifiedText,
    setSimplifiedText,
    secondDocumentText,
    setSecondDocumentText,
    comparisonResultText,
    isComparing,
    chatHistory,
    setChatHistory,
    handleAnalyze,
    handleCompare,
  };
}
