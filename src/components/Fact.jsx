import { useState } from 'react';

export default function Fact({ buttonOnly = false, loading: propLoading, error: propError, result: propResult, onProcess }) {
  const [internalResult, setInternalResult] = useState('');
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState('');

  const API_URL = 'http://localhost:5000/api';

  const handleFetch = async () => {
    // If parent provided an onFetch handler, call it and let parent manage state
    if (typeof onProcess === 'function') {
      return onProcess();
    }

    // Otherwise, handle the fetch internally
    setInternalLoading(true);
    setInternalError('');
    setInternalResult('');
    try {
      const res = await fetch(`${API_URL}/fact`);
      if (!res.ok) throw new Error('Failed to fetch fact');
      const data = await res.json();
      setInternalResult(data.fact);
    } catch (err) {
      setInternalError(err.message);
    } finally {
      setInternalLoading(false);
    }
  };

  const loading = propLoading ?? internalLoading;
  const error = propError ?? internalError;
  const result = propResult ?? internalResult;

  return (
    <div>
      {buttonOnly && (
        <>
          <button
            onClick={handleFetch}
            disabled={loading}
            className="px-6 py-3 bg-linear-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-teal-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-teal-500/30"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </>
      )}

      {error && !buttonOnly && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-700/50 text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {result && !buttonOnly && (
        <div className="mt-4 p-4 bg-slate-800 border border-teal-500/30 rounded-lg">
          <h3 className="font-bold text-teal-300 mb-3 text-2xl">Fact of the Day</h3>
          <p className="text-slate-100 whitespace-pre-wrap leading-relaxed">
            {result}
          </p>
        </div>
      )}

      {loading && !buttonOnly && (
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500/30 border-t-teal-500"></div>
        </div>
      )}
    </div>
  );
}