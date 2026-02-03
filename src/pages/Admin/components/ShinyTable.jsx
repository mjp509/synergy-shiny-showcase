import { API } from '../../../api/endpoints'
import styles from '../Admin.module.css'

export default function ShinyTable({ shinies, onEdit, onDelete }) {
  const entries = Object.entries(shinies).sort(([a], [b]) => parseInt(a) - parseInt(b))

  if (entries.length === 0) {
    return <p className={styles.hintText}>No shinies found for this player.</p>
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.shinyTable}>
        <thead>
          <tr>
            <th>#</th>
            <th>Sprite</th>
            <th>Pokemon</th>
            <th>Traits</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([id, shiny]) => {
            const traits = []
            if (shiny.Egg === 'Yes') traits.push('Egg')
            if (shiny.Alpha === 'Yes') traits.push('Alpha')
            if (shiny['Secret Shiny'] === 'Yes') traits.push('Secret')
            if (shiny.Sold === 'Yes') traits.push('Sold')
            if (shiny.Event === 'Yes') traits.push('Event')
            if (shiny.Favourite === 'Yes') traits.push('Fav')
            if (shiny.Legendary === 'Yes') traits.push('Legend')
            if (shiny.MysteriousBall === 'Yes') traits.push('Mystery')
            if (shiny.Safari === 'Yes') traits.push('Safari')
            if (shiny['Honey Tree'] === 'Yes') traits.push('Honey')

            const spriteName = shiny.Pokemon.toLowerCase().replace(/[^a-z0-9-]/g, '')

            return (
              <tr key={id} className={shiny.Sold === 'Yes' ? styles.soldRow : ''}>
                <td>{id}</td>
                <td>
                  <img
                    src={API.pokemonSprite(spriteName)}
                    alt={shiny.Pokemon}
                    className={styles.spriteImg}
                    onError={e => { e.target.style.display = 'none' }}
                  />
                </td>
                <td>{shiny.Pokemon}</td>
                <td>
                  <div className={styles.traitBadges}>
                    {traits.map(t => (
                      <span key={t} className={styles.traitBadge}>{t}</span>
                    ))}
                    {traits.length === 0 && <span className={styles.traitNone}>-</span>}
                  </div>
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    <button className={styles.editBtn} onClick={() => onEdit(id, shiny)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => onDelete(id, shiny)}>Delete</button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
