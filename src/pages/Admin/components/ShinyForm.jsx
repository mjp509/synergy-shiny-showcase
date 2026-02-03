import { useReducer, useEffect } from 'react'
import Autocomplete from './Autocomplete'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const YEARS = [
  '2013', '2014', '2015', '2016', '2017', '2018', '2019',
  '2020', '2021', '2022', '2023', '2024', '2025', '2026',
  '2027', '2028', '2029', '2030',
]

const YES_NO_FIELDS = [
  { key: 'Egg', label: 'Egg' },
  { key: 'Favourite', label: 'Favourite' },
  { key: 'Secret Shiny', label: 'Secret Shiny' },
  { key: 'Alpha', label: 'Alpha' },
  { key: 'Sold', label: 'Sold' },
  { key: 'Event', label: 'Event' },
  { key: 'Reaction', label: 'Reaction' },
  { key: 'MysteriousBall', label: 'Mysterious Ball' },
  { key: 'Safari', label: 'Safari' },
  { key: 'Honey Tree', label: 'Honey Tree' },
  { key: 'Legendary', label: 'Legendary' },
]

const now = new Date()
const currentMonth = MONTHS[now.getMonth()]
const currentYear = String(now.getFullYear())

function getDefaultState() {
  return {
    Pokemon: '',
    Month: currentMonth,
    Year: currentYear,
    Egg: 'No',
    Favourite: 'No',
    'Secret Shiny': 'No',
    Alpha: 'No',
    Sold: 'No',
    Event: 'No',
    Reaction: 'No',
    MysteriousBall: 'No',
    Safari: 'No',
    'Honey Tree': 'No',
    Legendary: 'No',
    'Reaction Link': '',
  }
}

function getEditState(data) {
  const base = getDefaultState()
  base.Month = ''
  base.Year = ''
  return { ...base, ...data }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'RESET':
      return getDefaultState()
    case 'LOAD':
      return getEditState(action.data)
    default:
      return state
  }
}

export default function ShinyForm({ initialData, onSubmit, submitLabel = 'Add', allPokemonNames = [], isMutating = false, isEditMode = false }) {
  const [form, dispatch] = useReducer(reducer, initialData || getDefaultState())

  useEffect(() => {
    if (initialData) dispatch({ type: 'LOAD', data: initialData })
  }, [initialData])

  function handleSubmit() {
    if (!form.Pokemon.trim()) return
    const data = { ...form }
    onSubmit(data)
  }

  function handleReset() {
    dispatch({ type: 'RESET' })
  }

  return (
    <div>
      <label>Pokemon Name:</label>
      <Autocomplete
        id="shinyFormPokemon"
        value={form.Pokemon}
        onChange={val => dispatch({ type: 'SET_FIELD', field: 'Pokemon', value: val })}
        getOptions={() => allPokemonNames}
        placeholder="mew"
      />

      <label htmlFor="shinyMonth">Month:</label>
      <select id="shinyMonth" value={form.Month} onChange={e => dispatch({ type: 'SET_FIELD', field: 'Month', value: e.target.value })}>
        <option value="">--</option>
        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
      </select>

      <label htmlFor="shinyYear">Year:</label>
      <select id="shinyYear" value={form.Year} onChange={e => dispatch({ type: 'SET_FIELD', field: 'Year', value: e.target.value })}>
        <option value="">--</option>
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </select>

      {YES_NO_FIELDS.map(({ key, label }) => (
        <div key={key}>
          <label htmlFor={`shiny_${key}`}>{label}:</label>
          <select
            id={`shiny_${key}`}
            value={form[key]}
            onChange={e => dispatch({ type: 'SET_FIELD', field: key, value: e.target.value })}
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      ))}

      <label>Reaction Link:</label>
      <input
        type="text"
        value={form['Reaction Link']}
        onChange={e => dispatch({ type: 'SET_FIELD', field: 'Reaction Link', value: e.target.value })}
        placeholder="Optional URL"
      />

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={handleSubmit} disabled={isMutating || !form.Pokemon.trim()}>
          {isMutating ? 'Saving...' : submitLabel}
        </button>
        <button onClick={handleReset} type="button" style={{ backgroundColor: '#555' }}>
          Reset
        </button>
      </div>
    </div>
  )
}

export { getDefaultState }
