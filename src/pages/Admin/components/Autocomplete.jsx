import { useState, useRef, useEffect } from 'react'
import styles from '../Admin.module.css'

export default function Autocomplete({ id, value, onChange, getOptions, placeholder }) {
  const [suggestions, setSuggestions] = useState([])
  const [show, setShow] = useState(false)
  const [focusIdx, setFocusIdx] = useState(-1)
  const ref = useRef(null)
  const blurTimeoutRef = useRef(null)

  useEffect(() => () => { if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current) }, [])

  function handleInput(val) {
    onChange(val)
    const lower = val.toLowerCase()
    if (!lower) { setSuggestions([]); setShow(false); return }
    const opts = getOptions().filter(o => o.toLowerCase().includes(lower))
    setSuggestions(opts)
    setShow(opts.length > 0)
    setFocusIdx(-1)
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') { setFocusIdx(i => Math.min(i + 1, suggestions.length - 1)) }
    else if (e.key === 'ArrowUp') { setFocusIdx(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Tab' && focusIdx >= 0) {
      e.preventDefault()
      onChange(suggestions[focusIdx])
      setShow(false)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id}
        ref={ref}
        type="text"
        value={value}
        onChange={e => handleInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length && setShow(true)}
        onBlur={() => { blurTimeoutRef.current = setTimeout(() => setShow(false), 100) }}
        placeholder={placeholder}
        autoComplete="off"
      />
      {show && (
        <div className={styles.suggestions}>
          {suggestions.map((s, i) => (
            <div
              key={s}
              className={`${styles.suggestion} ${i === focusIdx ? styles.suggestionActive : ''}`}
              onMouseDown={() => { onChange(s); setShow(false) }}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
