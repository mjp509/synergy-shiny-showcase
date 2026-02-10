import styles from './SearchBar.module.css'

export default function SearchBar({ value, onChange, placeholder = 'Search for a player...' }) {
  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete="off"
        placeholder={placeholder}
      />
    </div>
  )
}
