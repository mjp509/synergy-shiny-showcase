import styles from '../Admin.module.css'

export default function AdminLogTab({ logData }) {
  const sortedLog = [...logData].sort((a, b) => new Date(b.time) - new Date(a.time))

  if (sortedLog.length === 0) {
    return <p className={styles.hintText}>No log entries found.</p>
  }

  return (
    <div>
      <h3>Admin Log ({sortedLog.length} entries)</h3>
      <pre className={styles.logPreview}>
        {sortedLog.map(entry => {
          const date = new Date(entry.time)
          const formattedTime = date.toLocaleString(undefined, {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
          })
          return `Admin: ${entry.admin}\nAction:\n${entry.action}\nTime: ${formattedTime}\n-------------------------\n`
        }).join('')}
      </pre>
    </div>
  )
}
