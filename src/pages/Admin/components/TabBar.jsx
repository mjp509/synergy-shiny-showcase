import styles from '../Admin.module.css'

const TABS = [
  { key: 'add', label: 'Add Pokemon' },
  { key: 'edit', label: 'Edit Player' },
  { key: 'streamers', label: 'Streamers' },
  { key: 'log', label: 'Admin Log' },
  { key: 'json', label: 'Advanced (JSON)' },
]

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <div className={styles.tabBar}>
      {TABS.map(tab => (
        <button
          key={tab.key}
          className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
