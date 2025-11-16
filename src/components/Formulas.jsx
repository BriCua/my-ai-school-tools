import { useState } from 'react'

export default function Formulas({ text, buttonOnly = false, result: propResult, loading: propLoading, error: propError, onProcess }) {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const API_URL = 'http://localhost:5000/api'

  const handleExtractFormulas = async () => {
    // If parent provided an onProcess handler, call it and let parent manage state
    if (typeof onProcess === 'function') return onProcess()

    if (!text.trim()) {
      setError('Please enter some text')
      return
    }

    setLoading(true)
    setError('')
    setResult('')

    try {
      const response = await fetch(`${API_URL}/formulas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) throw new Error('Failed to extract formulas')

      const data = await response.json()
      setResult(data.formulas)
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
            onClick={handleExtractFormulas}
            disabled={propLoading ?? loading}
            className="px-6 py-3 bg-linear-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-orange-500/30"
          >
            {(propLoading ?? loading) ? 'Extracting...' : 'Process'}
          </button>
        </>
      )}

      {(propError ?? error) && !buttonOnly && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-700/50 text-red-200 rounded-lg">
          {propError ?? error}
        </div>
      )}

      {(propResult ?? result) && !buttonOnly && (
        <div className="mt-4 p-4 bg-slate-800 border border-orange-500/30 rounded-lg">
          <h3 className="font-bold text-orange-300 mb-3 text-2xl">Formulas</h3>
          <p className="text-slate-100 whitespace-pre-wrap">{propResult ?? result}</p>
        </div>
      )}

      {(propLoading ?? loading) && !buttonOnly && (
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500/30 border-t-orange-500"></div>
        </div>
      )}
    </div>
  )
}
