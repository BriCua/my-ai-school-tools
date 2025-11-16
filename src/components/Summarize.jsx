import { useState } from 'react'

export default function Summarize({ text, buttonOnly = false, result: propResult, loading: propLoading, error: propError, onProcess }) {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const API_URL = 'http://localhost:5000/api'

  // Convert markdown to JSX elements
  const parseMarkdown = (text) => {
    const parts = []
    let lastIndex = 0

    // Regular expression to find **bold text** patterns
    const boldRegex = /\*\*(.*?)\*\*/g
    let match

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }
      // Add bold text
      parts.push(
        <strong key={`bold-${match.index}`} className="font-bold">
          {match[1]}
        </strong>
      )
      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }

    return parts.length > 0 ? parts : text
  }

  const handleSummarize = async () => {
    // If parent provided an onProcess handler, call it and let parent manage state
    if (typeof onProcess === 'function') {
      return onProcess()
    }

    if (!text.trim()) {
      setError('Please enter some text')
      return
    }

    setLoading(true)
    setError('')
    setResult('')

    try {
      const response = await fetch(`${API_URL}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) throw new Error('Failed to summarize')

      const data = await response.json()
      setResult(data.summary)
    } catch (err) {
      setError(`Error: ${err.message}`)
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {buttonOnly && (
        <>
          <button
            onClick={handleSummarize}
            disabled={propLoading ?? loading}
            className="px-6 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/30"
          >
            {(propLoading ?? loading) ? 'Summarizing...' : 'Process'}
          </button>
        </>
      )}

      {(propError ?? error) && !buttonOnly && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-700/50 text-red-200 rounded-lg">
          {propError ?? error}
        </div>
      )}

      {(propResult ?? result) && !buttonOnly && (
        <div className="mt-4 p-4 bg-slate-800 border border-blue-500/30 rounded-lg">
          <h3 className="font-bold text-blue-300 mb-3 text-2xl">Summary</h3>
          <p className="text-slate-100 whitespace-pre-wrap leading-relaxed">
            {parseMarkdown(propResult ?? result)}
          </p>
        </div>
      )}

      {(propLoading ?? loading) && !buttonOnly && (
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500/30 border-t-blue-500"></div>
        </div>
      )}
    </div>
  )
}
