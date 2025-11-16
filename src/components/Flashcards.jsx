import { useEffect, useMemo, useState } from 'react'

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Flashcards({ text, buttonOnly = false, result: propResult, loading: propLoading, error: propError, onProcess }) {
  const [internalResult, setInternalResult] = useState(null)
  const [deck, setDeck] = useState([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [wrong, setWrong] = useState([])
  const [right, setRight] = useState([])
  const [viewMode, setViewMode] = useState('study') // study | summary | review

  const cardsFromProps = propResult ?? internalResult

  // Load session from localStorage when cards arrive
  useEffect(() => {
    if (Array.isArray(cardsFromProps) && cardsFromProps.length > 0) {
      // Initialize a new shuffled deck
      const initial = shuffle(cardsFromProps)
      setDeck(initial)
      setIndex(0)
      setFlipped(false)
      setWrong([])
      setRight([])
      setViewMode('study')
      // persist
      try {
        localStorage.setItem('flashcards_session', JSON.stringify({ deck: initial, index: 0, wrong: [], right: [] }))
      } catch (e) {}
    }
  }, [cardsFromProps])

  // Restore session if present (only if no prop cards provided)
  useEffect(() => {
    if (!cardsFromProps) {
      try {
        const raw = localStorage.getItem('flashcards_session')
        if (raw) {
          const s = JSON.parse(raw)
          if (Array.isArray(s.deck) && s.deck.length > 0) {
            setDeck(s.deck)
            setIndex(s.index || 0)
            setWrong(s.wrong || [])
            setRight(s.right || [])
            setViewMode('study')
          }
        }
      } catch (e) {}
    }
  }, [cardsFromProps])

  // Persist session on change
  useEffect(() => {
    try {
      localStorage.setItem('flashcards_session', JSON.stringify({ deck, index, wrong, right }))
    } catch (e) {}
  }, [deck, index, wrong, right])

  const current = deck[index]

  // Helper actions
  const advance = () => {
    setFlipped(false)
    if (index + 1 < deck.length) setIndex(index + 1)
    else setViewMode('summary')
  }

  const handleWrong = () => {
    if (!current) return
    setWrong((w) => [...w, current])
    advance()
  }

  const handleRight = () => {
    if (!current) return
    setRight((r) => [...r, current])
    advance()
  }

  const handleFlip = () => setFlipped((f) => !f)

  const restartAll = () => {
    const n = shuffle(cardsFromProps || deck)
    setDeck(n)
    setIndex(0)
    setFlipped(false)
    setWrong([])
    setRight([])
    setViewMode('study')
  }

  const restartWrongOnly = () => {
    if (!wrong || wrong.length === 0) return
    const n = shuffle(wrong)
    setDeck(n)
    setIndex(0)
    setFlipped(false)
    setWrong([])
    setRight([])
    setViewMode('study')
  }

  // Keyboard controls
  useEffect(() => {
    const onKey = (e) => {
      if (viewMode !== 'study') return
      if (e.key === 'ArrowLeft') handleWrong()
      else if (e.key === 'ArrowRight') handleRight()
      else if (e.key === ' ') handleFlip()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [deck, index, viewMode, wrong, right])

  // Render helpers
  const total = deck.length

  // If propResult is a JSON string, attempt parse
  useEffect(() => {
    if (typeof propResult === 'string') {
      try {
        const parsed = JSON.parse(propResult)
        if (Array.isArray(parsed)) setInternalResult(parsed)
      } catch (e) {}
    }
  }, [propResult])

  // When used as buttonOnly without parent onProcess, call internal fetch
  const API_URL = 'http://localhost:5000/api'
  const handleCreateFlashcards = async () => {
    if (typeof onProcess === 'function') return onProcess()
    if (!text || !text.trim()) return
    try {
      const res = await fetch(`${API_URL}/flashcards`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      if (data?.flashcards) setInternalResult(data.flashcards)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div>
      {buttonOnly && (
        <>
          <button
            onClick={handleCreateFlashcards}
            disabled={propLoading ?? false}
            className="px-6 py-3 bg-linear-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/30"
          >
            {(propLoading ?? false) ? 'Creating...' : 'Process'}
          </button>
        </>
      )}

      {/* Study area */}
      {!buttonOnly && (
        <div>
          {viewMode === 'study' && current && (
            <div className="p-6 bg-slate-800 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Card {index + 1} / {total}</h3>
                  <div className="text-sm text-slate-400">Difficulty: <span className="font-medium text-purple-300">{current.difficulty}</span></div>
                </div>
                <div className="text-sm text-slate-400">Wrong: {wrong.length} • Right: {right.length}</div>
              </div>

              <div className="min-h-[160px] p-6 bg-slate-900 rounded-md mb-4">
                {!flipped ? (
                  <div className="text-lg font-medium">{current.question}</div>
                ) : (
                  <div className="whitespace-pre-wrap">{current.answer}</div>
                )}
              </div>

              <div className="flex justify-between">
                <button onClick={handleWrong} className="px-4 py-2 bg-red-600 rounded-md">Wrong</button>
                <button onClick={handleFlip} className="px-6 py-2 bg-slate-700 rounded-md">{flipped ? 'Show Question' : 'Show Answer'}</button>
                <button onClick={handleRight} className="px-4 py-2 bg-green-600 rounded-md">Right</button>
              </div>
            </div>
          )}

          {viewMode === 'study' && !current && (
            <div className="p-6 text-center">
              <div className="text-lg font-semibold">No cards available</div>
            </div>
          )}

          {viewMode === 'summary' && (
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-3">Session Summary</h3>
              <p className="mb-3">Total: {total} • Right: {right.length} • Wrong: {wrong.length}</p>

              <div className="flex gap-3 mb-4">
                <button onClick={() => setViewMode('review')} className="px-4 py-2 bg-slate-700 rounded-md">View Wrong</button>
                <button onClick={() => setViewMode('review-right')} className="px-4 py-2 bg-slate-700 rounded-md">View Right</button>
                <button onClick={restartAll} className="px-4 py-2 bg-blue-600 rounded-md">Start Over</button>
                <button onClick={restartWrongOnly} disabled={wrong.length === 0} className="px-4 py-2 bg-orange-600 rounded-md disabled:opacity-50">Start Wrong Only</button>
              </div>
            </div>
          )}

          {viewMode === 'review' && (
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Wrong Cards</h3>
                <button onClick={() => setViewMode('summary')} className="px-3 py-1 bg-slate-700 rounded-md text-sm">Back</button>
              </div>
              {wrong.length === 0 ? (<div>No wrong cards.</div>) : (
                <ul className="list-disc pl-6 space-y-3">
                  {wrong.map((c) => (
                    <li key={c.id}>
                      <div className="font-medium">Q: {c.question}</div>
                      <div className="text-slate-300">A: {c.answer}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {viewMode === 'review-right' && (
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Right Cards</h3>
                <button onClick={() => setViewMode('summary')} className="px-3 py-1 bg-slate-700 rounded-md text-sm">Back</button>
              </div>
              {right.length === 0 ? (<div>No right cards.</div>) : (
                <ul className="list-disc pl-6 space-y-3">
                  {right.map((c) => (
                    <li key={c.id}>
                      <div className="font-medium">Q: {c.question}</div>
                      <div className="text-slate-300">A: {c.answer}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Show loading spinner when propLoading is true */}
          {(propLoading ?? false) && (
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500/30 border-t-purple-500"></div>
            </div>
          )}

          {/* Show error */}
          {(propError) && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-700/50 text-red-200 rounded-lg">{propError}</div>
          )}

          {/* When study finishes (index >= deck.length) show summary trigger */}
          {viewMode === 'study' && deck.length > 0 && index >= deck.length && setViewMode('summary')}
        </div>
      )}
    </div>
  )
}
