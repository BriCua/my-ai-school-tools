import "./App.css";
import { useState, useEffect } from "react";
import Summarize from "./components/Summarize";
import Flashcards from "./components/Flashcards";
import Formulas from "./components/Formulas";

function App() {
  useEffect(() => {
    const fix = (e) => {
      if (document.activeElement?.type === "number") {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", fix, { passive: false });
    return () => window.removeEventListener("wheel", fix);
  }, []);
  const [textInput, setTextInput] = useState("");
  const [count, setCount] = useState(15);
  const [activeTab, setActiveTab] = useState("summarize");
  const [appLoading, setAppLoading] = useState(false);
  const [appResult, setAppResult] = useState("");
  const [appError, setAppError] = useState("");

  const API_BASE = "http://localhost:5000/api";

  const handleSetActive = (tab) => {
    setActiveTab(tab);
    // clear UI state when changing tabs
    setAppLoading(false);
    setAppError("");
    setAppResult("");
  };

  const handleProcess = async () => {
    if (!textInput.trim()) {
      setAppError("Please enter some text");
      return;
    }

    setAppLoading(true);
    setAppError("");
    setAppResult("");

    const endpoint =
      activeTab === "summarize"
        ? "/summarize"
        : activeTab === "flashcards"
        ? "/flashcards"
        : "/formulas";

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textInput, count: count }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || "Request failed");
      }

      const data = await res.json();
      let out = "";
      if (activeTab === "summarize") out = data.summary;
      else if (activeTab === "flashcards") out = data.flashcards;
      else if (activeTab === "formulas") out = data.formulas;

      setAppResult(out);
    } catch (err) {
      setAppError(err.message || "Error");
      console.error(err);
    } finally {
      setAppLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            AI School Tools
          </h1>
          <p className="text-slate-400 text-lg">Powered by Groq AI</p>
        </div>

        {/* Global Text Input */}
        <div className="bg-slate-900 rounded-xl shadow-2xl p-6 mb-6 border border-slate-800">
          <label className="block text-lg font-semibold text-slate-100 mb-3">
            Enter Text
          </label>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Enter text to process..."
            className="w-full h-40 p-4 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />

          {/* Action Buttons with Process Button */}
          <div className="mt-6 flex gap-3 flex-wrap items-center justify-between">
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => handleSetActive("summarize")}
                className={`px-6 py-2 font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === "summarize"
                    ? "bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                }`}
              >
                Summarize
              </button>
              <button
                onClick={() => handleSetActive("flashcards")}
                className={`px-6 py-2 font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === "flashcards"
                    ? "bg-linear-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/50"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                }`}
              >
                Flashcards
              </button>
              <button
                onClick={() => handleSetActive("formulas")}
                className={`px-6 py-2 font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === "formulas"
                    ? "bg-linear-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/50"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                }`}
              >
                Formulas
              </button>
            </div>

            {/* Process Button Container */}
            <div className="shrink-0 flex gap-4">
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                min="1"
                max="50"
                className={activeTab === "flashcards" ? "bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center w-12 font-semibold" : "hidden"}
              />
              {activeTab === "summarize" && (
                <Summarize
                  text={textInput}
                  buttonOnly
                  loading={appLoading}
                  error={appError}
                  result={appResult}
                  onProcess={handleProcess}
                />
              )}
              {activeTab === "flashcards" && (
                <Flashcards
                  text={textInput}
                  buttonOnly
                  loading={appLoading}
                  error={appError}
                  result={appResult}
                  onProcess={handleProcess}
                />
              )}
              {activeTab === "formulas" && (
                <Formulas
                  text={textInput}
                  buttonOnly
                  loading={appLoading}
                  error={appError}
                  result={appResult}
                  onProcess={handleProcess}
                />
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-slate-900 rounded-xl shadow-2xl p-6 border border-slate-800">
          <span className="font-semibold" hidden={appResult}>
            Results will appear here
          </span>
          {activeTab === "summarize" && (
            <Summarize
              text={textInput}
              loading={appLoading}
              error={appError}
              result={appResult}
            />
          )}
          {activeTab === "flashcards" && (
            <Flashcards
              text={textInput}
              loading={appLoading}
              error={appError}
              result={appResult}
            />
          )}
          {activeTab === "formulas" && (
            <Formulas
              text={textInput}
              loading={appLoading}
              error={appError}
              result={appResult}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
