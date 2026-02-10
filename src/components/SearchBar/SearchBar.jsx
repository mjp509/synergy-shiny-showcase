import { useState, useRef, useEffect } from 'react'
import styles from './SearchBar.module.css'

export default function SearchBar({ 
  value, 
  onChange, 
  placeholder = 'Search for a player...',
  suggestions = [],
  onSuggestionSelect
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (value.trim() && suggestions.length > 0) {
      const searchLower = value.toLowerCase()
      const filtered = suggestions
        .filter(s => s.toLowerCase().includes(searchLower))
        .slice(0, 8) // Limit to 8 suggestions
      setFilteredSuggestions(filtered)
      setIsOpen(filtered.length > 0)
    } else {
      setFilteredSuggestions([])
      setIsOpen(false)
    }
  }, [value, suggestions])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion)
    setIsOpen(false)
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion)
    }
  }

  return (
    <div className={styles.searchBarContainer} ref={containerRef}>
      <div className={styles.searchBar}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => {
            if (value.trim() && filteredSuggestions.length > 0) {
              setIsOpen(true)
            }
          }}
          autoComplete="off"
          placeholder={placeholder}
        />
      </div>
      {isOpen && filteredSuggestions.length > 0 && (
        <ul className={styles.suggestionsList}>
          {filteredSuggestions.map((suggestion, idx) => (
            <li 
              key={idx}
              className={styles.suggestionItem}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
