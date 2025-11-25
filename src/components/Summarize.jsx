import { useState } from 'react'

export default function Summarize({ text, buttonOnly = false, result: propResult, loading: propLoading, error: propError, onProcess }) {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copyStatus, setCopyStatus] = useState('')

  const API_URL = 'http://localhost:5000/api'

  // Render a small subset of Markdown to JSX (headings, lists, bold, inline code, paragraphs, code blocks)
  const renderMarkdown = (text) => {
    if (typeof text !== 'string') return text

    const lines = text.split(/\r?\n/)
    const nodes = []
    let i = 0
    let inCodeBlock = false
    let codeBlockLines = []
    let listBuffer = null

    const flushList = () => {
      if (!listBuffer) return
      nodes.push(
        <ul key={`list-${i}`} className="list-disc list-inside ml-4 mb-2">
          {listBuffer.map((li, idx) => (
            <li key={idx} className="mb-1">{li}</li>
          ))}
        </ul>
      )
      listBuffer = null
    }

    while (i < lines.length) {
      const line = lines[i]

      // Code fence start/end
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // close code block
          nodes.push(
            <pre key={`code-${i}`} className="bg-slate-900 p-3 rounded-md overflow-auto mb-2 text-sm">
              <code>{codeBlockLines.join('\n')}</code>
            </pre>
          )
          codeBlockLines = []
          inCodeBlock = false
        } else {
          inCodeBlock = true
        }
        i++
        continue
      }

      if (inCodeBlock) {
        codeBlockLines.push(line)
        i++
        continue
      }

      // Heading
      const hMatch = line.match(/^\s{0,3}(#{1,6})\s+(.*)$/)
      if (hMatch) {
        flushList()
        const level = Math.min(6, hMatch[1].length)
        const content = hMatch[2]
        const Tag = `h${level}`
        nodes.push(
          <Tag key={`h-${i}`} className={`font-bold text-blue-300 mb-2 ${level === 1 ? 'text-2xl' : level === 2 ? 'text-xl' : 'text-lg'}`}>
            {renderInlineMarkdown(content)}
          </Tag>
        )
        i++
        continue
      }

      // Unordered list
      const ulMatch = line.match(/^\s*[-*+]\s+(.*)$/)
      if (ulMatch) {
        listBuffer = listBuffer || []
        listBuffer.push(renderInlineMarkdown(ulMatch[1]))
        i++
        // gather following list items
        while (i < lines.length) {
          const next = lines[i].match(/^\s*[-*+]\s+(.*)$/)
          if (!next) break
          listBuffer.push(renderInlineMarkdown(next[1]))
          i++
        }
        flushList()
        continue
      }

      // Ordered list
      const olMatch = line.match(/^\s*\d+\.\s+(.*)$/)
      if (olMatch) {
        listBuffer = listBuffer || []
        listBuffer.push(renderInlineMarkdown(olMatch[1]))
        i++
        while (i < lines.length) {
          const next = lines[i].match(/^\s*\d+\.\s+(.*)$/)
          if (!next) break
          listBuffer.push(renderInlineMarkdown(next[1]))
          i++
        }
        // render as ul to keep styling simple
        flushList()
        continue
      }

      // Blank line -> paragraph separator
      if (line.trim() === '') {
        flushList()
        i++
        continue
      }

      // Normal paragraph line (may be part of a paragraph)
      const paragraphLines = [renderInlineMarkdown(line)]
      i++
      while (i < lines.length && lines[i].trim() !== '') {
        paragraphLines.push(' ')
        paragraphLines.push(renderInlineMarkdown(lines[i]))
        i++
      }
      nodes.push(
        <p key={`p-${i}`} className="text-slate-100 leading-relaxed mb-2">
          {paragraphLines}
        </p>
      )
    }

    // if nothing parsed, return raw text
    if (nodes.length === 0) return text
    return nodes
  }

  // Inline formatting for bold, italic, inline code, and links
  const renderInlineMarkdown = (str) => {
    if (typeof str !== 'string') return str
    // Escape false positives handled simply by sequential replace
    const parts = []
    let rest = str

    // Replace links [text](url) -> text
    rest = rest.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')

    // Inline code `code`
    rest = rest.replace(/`([^`]+)`/g, (m, g1) => `@@CODE:${g1.replace(/@/g, '@@')}@@`) // placeholder

    // Bold **text**
    rest = rest.replace(/\*\*(.*?)\*\*/g, (m, g1) => `@@BOLD:${g1}@@`)

    // Italic *text* or _text_
    rest = rest.replace(/\*(.*?)\*/g, (m, g1) => `@@ITALIC:${g1}@@`)
    rest = rest.replace(/_(.*?)_/g, (m, g1) => `@@ITALIC:${g1}@@`)

    // Now split by placeholders
    const tokens = rest.split(/(@@[^@]+@@)/g).filter(Boolean)
    return tokens.map((tok, idx) => {
      const codeMatch = tok.match(/^@@CODE:(.*)@@$/)
      if (codeMatch) return <code key={idx} className="bg-slate-800 px-1 rounded text-sm">{codeMatch[1].replace(/@@/g, '@')}</code>
      const boldMatch = tok.match(/^@@BOLD:(.*)@@$/)
      if (boldMatch) return <strong key={idx} className="font-bold">{boldMatch[1]}</strong>
      const italicMatch = tok.match(/^@@ITALIC:(.*)@@$/)
      if (italicMatch) return <em key={idx} className="italic">{italicMatch[1]}</em>
      return <span key={idx}>{tok}</span>
    })
  }

  // Strip Markdown to plain text (preserve newlines). Used for copying.
  const stripMarkdown = (md) => {
    if (!md) return ''
    let text = String(md)
    // Remove code fences
    text = text.replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, '\n'))
    // Convert headings -> keep content
    text = text.replace(/^\s{0,3}#{1,6}\s+/gm, '')
    // Convert links [text](url) -> text
    text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove bold/italic markers
    text = text.replace(/\*\*(.*?)\*\*/g, '$1')
    text = text.replace(/\*(.*?)\*/g, '$1')
    text = text.replace(/__(.*?)__/g, '$1')
    text = text.replace(/_(.*?)_/g, '$1')
    // Remove inline code backticks
    text = text.replace(/`([^`]+)`/g, '$1')
    // Remove list markers but keep dash for readability
    text = text.replace(/^\s*[-*+]\s+/gm, '- ')
    text = text.replace(/^\s*\d+\.\s+/gm, '- ')
    // Trim trailing spaces on lines
    text = text.split(/\r?\n/).map(l => l.replace(/[ \t]+$/,'')).join('\n')
    return text
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

  const handleCopy = async () => {
    const raw = (propResult ?? result) || ''
    if (!raw) return

    const textToCopy = stripMarkdown(raw)

    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopyStatus('Copied!')
      setTimeout(() => setCopyStatus(''), 2000)
    } catch (err) {
      // fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = textToCopy
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        setCopyStatus('Copied!')
      } catch (err2) {
        setCopyStatus('Copy failed')
      }
      document.body.removeChild(textarea)
      setTimeout(() => setCopyStatus(''), 2000)
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-blue-300 text-2xl">Summary</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1 bg-slate-700 rounded-md text-sm hover:bg-slate-600"
              >
                Copy
              </button>
              {copyStatus && <span className="text-sm text-green-300">{copyStatus}</span>}
            </div>
          </div>
          <div className="text-slate-100">
            {renderMarkdown(propResult ?? result)}
          </div>
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
