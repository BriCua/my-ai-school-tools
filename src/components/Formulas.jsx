import { useState } from "react";
import { renderMarkdown } from "../utils/markdownParser.jsx"; 
// adjust the path if needed

export default function Formulas({
  text,
  buttonOnly = false,
  result: propResult,
  loading: propLoading,
  error: propError,
  onProcess,
}) {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:5000/api";

  const handleExtractFormulas = async () => {
    if (typeof onProcess === "function") return onProcess();

    if (!text.trim()) {
      setError("Please enter some text");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch(`${API_URL}/formulas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error("Failed to extract formulas");

      const data = await response.json();
      setResult(data.formulas);
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const finalResult = propResult ?? result;
  const finalLoading = propLoading ?? loading;
  const finalError = propError ?? error;

  return (
    <div>
      {/* Button-only mode */}
      {buttonOnly && (
        <button
          onClick={handleExtractFormulas}
          disabled={finalLoading}
          className="px-6 py-3 bg-linear-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-orange-500/30"
        >
          {finalLoading ? "Extracting..." : "Process"}
        </button>
      )}

      {/* Error area */}
      {finalError && !buttonOnly && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-700/50 text-red-200 rounded-lg">
          {finalError}
        </div>
      )}

      {/* Markdown + KaTeX result */}
      {finalResult && !buttonOnly && (
        <div className="mt-4 p-4 bg-slate-800 border border-orange-500/30 rounded-lg prose prose-invert max-w-none">
          <h3 className="font-bold text-orange-300 mb-3 text-2xl">Formulas</h3>
          {renderMarkdown(finalResult)}
        </div>
      )}

      {/* Loading spinner */}
      {finalLoading && !buttonOnly && (
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500/30 border-t-orange-500"></div>
        </div>
      )}
    </div>
  );
}
