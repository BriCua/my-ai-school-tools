import "./App.css";
import "katex/dist/katex.min.css";

import { useState, useEffect, useCallback } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import Summarize from "./components/Summarize";
import Flashcards from "./components/Flashcards";
import Formulas from "./components/Formulas";
import Fact from "./components/Fact";

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
  const [appLoading, setAppLoading] = useState(false);
  const [appResult, setAppResult] = useState("");
  const [appError, setAppError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname.substring(1); // e.g., "summarize"

  const API_BASE = "http://localhost:5000/api";

  const handleTabChange = useCallback(
    (path) => {
      navigate(path);
      // clear UI state when changing tabs
      setAppLoading(false);
      setAppError("");
      setAppResult("");
    },
    [navigate]
  );

  const handleProcess = useCallback(async () => {
    const endpoint = location.pathname;

    // For POST routes, require text input.
    if (endpoint !== "/fact" && !textInput.trim()) {
      setAppError("Please enter some text");
      return;
    }

    setAppLoading(true);
    setAppError("");
    setAppResult("");

    try {
      let res;
      if (endpoint === "/fact") {
        // GET request for the fact
        res = await fetch(`${API_BASE}/fact`);
      } else {
        // POST request for other tools
        res = await fetch(`${API_BASE}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textInput, count: count }),
        });
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || "Request failed");
      }

      const data = await res.json();
      let out = "";
      if (endpoint === "/summarize") out = data.summary;
      else if (endpoint === "/flashcards") out = data.flashcards;
      else if (endpoint === "/formulas") out = data.formulas;
      else if (endpoint === "/fact") out = data.fact;

      setAppResult(out);
    } catch (err) {
      setAppError(err.message || "Error");
      console.error(err);
    } finally {
      setAppLoading(false);
    }
  }, [textInput, count, location.pathname]);

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
            placeholder={
              activeTab === "summarize"
                ? "Enter text to summarize..."
                : activeTab === "flashcards"
                ? "Enter text to generate flashcards from..."
                : activeTab === "formulas"
                ? "Enter text to extract formulas from..."
                : "No text input needed for facts. Just click Generate!"
            }
            disabled={activeTab === "fact"}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="w-full h-40 p-4 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors duration-200 disabled:bg-slate-800/50 disabled:cursor-not-allowed"
          />

          {/* Action Buttons with Process Button */}
          <div className="mt-6 flex gap-3 flex-wrap items-center justify-between">
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => handleTabChange("/summarize")}
                className={`px-6 py-2 font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === "summarize"
                    ? "bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                }`}
              >
                Summarize
              </button>
              <button
                onClick={() => handleTabChange("/flashcards")}
                className={`px-6 py-2 font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === "flashcards"
                    ? "bg-linear-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/50"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                }`}
              >
                Flashcards
              </button>
              <button
                onClick={() => handleTabChange("/formulas")}
                className={`px-6 py-2 font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === "formulas"
                    ? "bg-linear-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/50"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                }`}
              >
                Formulas
              </button>
              <button
                onClick={() => handleTabChange("/fact")}
                className={`px-6 py-2 font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === "fact"
                    ? "bg-linear-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/50"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                }`}
              >
                Fact
              </button>
            </div>

            {/* Process Button Container */}
            <div className="shrink-0 flex gap-4 min-w-[130px] justify-end">
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                min="1"
                max="50"
                className={activeTab === "flashcards" ? "bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center w-12 font-semibold" : "hidden"}
              />
              <Routes>
                <Route
                  path="/summarize"
                  element={<Summarize buttonOnly onProcess={handleProcess} />}
                />
                <Route
                  path="/flashcards"
                  element={<Flashcards buttonOnly onProcess={handleProcess} />}
                />
                <Route
                  path="/formulas"
                  element={<Formulas buttonOnly onProcess={handleProcess} />}
                />
                <Route
                  path="/fact"
                  element={<Fact buttonOnly onProcess={handleProcess} />}
                />
              </Routes>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-slate-900 rounded-xl shadow-2xl p-6 border border-slate-800 min-h-[100px]">
          <span className="font-semibold" hidden={appResult}>
            Results will appear here
          </span>
          <Routes>
            {/* Redirect from root to /summarize */}
            <Route path="/" element={<Navigate to="/summarize" replace />} />
            <Route
              path="/summarize"
              element={
                <Summarize loading={appLoading} error={appError} result={appResult} />
              }
            />
            <Route
              path="/flashcards"
              element={
                <Flashcards loading={appLoading} error={appError} result={appResult} />
              }
            />
            <Route
              path="/formulas"
              element={
                <Formulas loading={appLoading} error={appError} result={appResult} />
              }
            />
            <Route
              path="/fact"
              element={
                <Fact loading={appLoading} error={appError} result={appResult} />
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
