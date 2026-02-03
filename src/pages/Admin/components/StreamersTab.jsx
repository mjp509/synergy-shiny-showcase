import { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'
import styles from '../Admin.module.css'

export default function StreamersTab({ streamersDB, onAdd, onDelete, isMutating }) {
  const [pokeName, setPokeName] = useState('')
  const [twitchName, setTwitchName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  async function handleAdd() {
    if (!pokeName.trim() || !twitchName.trim()) return
    const result = await onAdd(pokeName, twitchName)
    if (result?.success) {
      setPokeName('')
      setTwitchName('')
    }
    return result
  }

  async function handleConfirmDelete() {
    if (!confirmDelete) return
    const result = await onDelete(confirmDelete)
    setConfirmDelete(null)
    return result
  }

  const streamerEntries = Object.entries(streamersDB).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div>
      <h3>Add Streamer</h3>
      <label>PokeMMO Name:</label>
      <input
        type="text"
        value={pokeName}
        onChange={e => setPokeName(e.target.value)}
        placeholder="MiroMMO"
      />
      <label>Twitch Name:</label>
      <input
        type="text"
        value={twitchName}
        onChange={e => setTwitchName(e.target.value)}
        placeholder="MiroMMO"
      />
      <button onClick={handleAdd} disabled={isMutating || !pokeName.trim() || !twitchName.trim()}>
        {isMutating ? 'Saving...' : 'Add Streamer'}
      </button>

      <h3>Current Streamers ({streamerEntries.length})</h3>
      {streamerEntries.length === 0 ? (
        <p className={styles.hintText}>No streamers in the database.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.shinyTable}>
            <thead>
              <tr>
                <th>PokeMMO Name</th>
                <th>Twitch Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {streamerEntries.map(([name, data]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{data.twitch_username}</td>
                  <td>
                    <button className={styles.deleteBtn} onClick={() => setConfirmDelete(name)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Streamer"
          message={`Are you sure you want to delete streamer "${confirmDelete}"?`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
