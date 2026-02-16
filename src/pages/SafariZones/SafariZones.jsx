import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentHead } from '../../hooks/useDocumentHead'
import { getAssetUrl } from '../../utils/assets'
import { getLocalPokemonGif, onGifError, normalizePokemonName } from '../../utils/pokemon'
import safariData from '../../data/safari_zones.json'
import styles from './SafariZones.module.css'

const REGIONS = ['kanto', 'johto', 'hoenn', 'sinnoh']
const REGION_LABELS = { kanto: 'Kanto', johto: 'Johto', hoenn: 'Hoenn', sinnoh: 'Sinnoh' }

function getOddsClass(odds) {
  if (odds >= 50) return styles.oddsHigh
  if (odds >= 20) return styles.oddsMedium
  return styles.oddsLow
}

const ENCOUNTER_LABELS = {
  standard: 'Always',
  day: 'Day',
  night: 'Night',
  rotation: 'Rotation',
  water: 'Water',
  grass: 'Grass',
}

function getEncounterClass(type) {
  if (type === 'day') return styles.encounterDay
  if (type === 'night') return styles.encounterNight
  if (type === 'rotation') return styles.encounterRotation
  if (type === 'water') return styles.encounterWater
  return styles.encounterStandard
}

function PokemonCard({ name, encounterType, catchData }) {
  const data = catchData?.[name]
  return (
    <Link to={`/pokemon/${normalizePokemonName(name)}`} className={styles.pokemonCard}>
      <img
        src={getLocalPokemonGif(name)}
        alt={name}
        className={styles.pokemonGif}
        onError={onGifError(name, false)}
        loading="lazy"
      />
      <span className={styles.pokemonName} title={name}>{name}</span>
      {data && (
        <span className={`${styles.pokemonOdds} ${getOddsClass(data.bestOdds)}`}>
          {data.bestOdds}%
        </span>
      )}
      <span className={`${styles.encounterBadge} ${getEncounterClass(encounterType)}`}>{ENCOUNTER_LABELS[encounterType] || encounterType}</span>
    </Link>
  )
}

function CatchDataTable({ catchData }) {
  const [sortKey, setSortKey] = useState('bestOdds')
  const [sortDir, setSortDir] = useState('desc')
  const [search, setSearch] = useState('')

  const sorted = useMemo(() => {
    const entries = Object.entries(catchData).map(([name, d]) => ({ name, ...d }))
    const filtered = search
      ? entries.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      : entries
    filtered.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      return sortDir === 'asc' ? av - bv : bv - av
    })
    return filtered
  }, [catchData, sortKey, sortDir, search])

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir(key === 'name' ? 'asc' : 'desc') }
  }

  function sortIcon(key) {
    if (sortKey !== key) return ''
    return sortDir === 'asc' ? ' ▲' : ' ▼'
  }

  return (
    <div className={styles.tableSection}>
      <h3>Full Catch Data</h3>
      <input
        type="text"
        placeholder="Search Pokemon..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className={styles.searchInput}
      />
      <div className={styles.tableWrapper}>
        <table className={styles.catchTable}>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>Pokemon<span className={styles.sortIcon}>{sortIcon('name')}</span></th>
              <th onClick={() => handleSort('catchRate')}>Catch Rate<span className={styles.sortIcon}>{sortIcon('catchRate')}</span></th>
              <th onClick={() => handleSort('fleeRate')}>Flee Rate<span className={styles.sortIcon}>{sortIcon('fleeRate')}</span></th>
              <th onClick={() => handleSort('ballsOnly')}>Balls Only<span className={styles.sortIcon}>{sortIcon('ballsOnly')}</span></th>
              <th onClick={() => handleSort('oneBait')}>One Bait<span className={styles.sortIcon}>{sortIcon('oneBait')}</span></th>
              <th onClick={() => handleSort('oneMud')}>One Mud<span className={styles.sortIcon}>{sortIcon('oneMud')}</span></th>
              <th onClick={() => handleSort('bestOdds')}>Best Odds<span className={styles.sortIcon}>{sortIcon('bestOdds')}</span></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(p => (
              <tr key={p.name}>
                <td>
                  <Link to={`/pokemon/${normalizePokemonName(p.name)}`} className={styles.pokemonCell}>
                    <img
                      src={getLocalPokemonGif(p.name)}
                      alt={p.name}
                      className={styles.tableGif}
                      onError={onGifError(p.name, false)}
                      loading="lazy"
                    />
                    {p.name}
                  </Link>
                </td>
                <td>{p.catchRate}</td>
                <td>{p.fleeRate}</td>
                <td>{p.ballsOnly}%</td>
                <td>{p.oneBait}%</td>
                <td>{p.oneMud}%</td>
                <td className={getOddsClass(p.bestOdds)}>{p.bestOdds}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const ROTATION_COLORS = {
  Carnivine: styles.rotationCarnivine,
  Skorupi: styles.rotationSkorupi,
  Croagunk: styles.rotationCroagunk,
}

function RotationSchedule({ schedule }) {
  // Build a lookup: day -> area -> pokemon
  const grid = schedule.days.map(d => {
    const row = {}
    for (const [pokemon, areas] of Object.entries(d.areas)) {
      for (const area of areas) {
        row[area] = pokemon
      }
    }
    return { day: d.day, row }
  })

  return (
    <div className={styles.rotationSection}>
      <h3>Daily Rotation Schedule</h3>
      <p className={styles.rotationNote}>Carnivine, Skorupi, and Croagunk rotate across the 6 areas on a 7-day in-game cycle. One in-game day ≈ 6 real hours.</p>
      <div className={styles.tableWrapper}>
        <table className={styles.rotationTable}>
          <thead>
            <tr>
              <th>Day</th>
              {[1,2,3,4,5,6].map(a => <th key={a}>Area {a}</th>)}
            </tr>
          </thead>
          <tbody>
            {grid.map(({ day, row }) => (
              <tr key={day}>
                <td className={styles.rotationDay}>{day}</td>
                {[1,2,3,4,5,6].map(a => {
                  const mon = row[a] || '—'
                  return (
                    <td key={a} className={ROTATION_COLORS[mon] || ''}>
                      {mon}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RegionContent({ region }) {
  const data = safariData[region]
  const [selectedArea, setSelectedArea] = useState(0)

  if (!data) {
    return (
      <div className={styles.comingSoon}>
        <h2>{REGION_LABELS[region]} Safari Zone</h2>
        <p>Coming Soon — check back later!</p>
      </div>
    )
  }

  const area = data.areas[selectedArea]

  return (
    <div className={styles.regionContent}>
      <p className={styles.regionGame}>{data.game}</p>
      <p className={styles.regionDescription}>{data.description}</p>

      <div className={styles.areaSelector}>
        {data.areas.map((a, i) => (
          <button
            key={a.name}
            className={`${styles.areaPill} ${i === selectedArea ? styles.areaPillActive : ''}`}
            onClick={() => setSelectedArea(i)}
          >
            {a.name}
          </button>
        ))}
      </div>

      <div className={styles.infoBox}>
        <p><strong>Encounters:</strong> <span className={styles.encounterDay} style={{fontSize:'0.8rem',padding:'1px 5px',borderRadius:'4px'}}>Day</span> = 4:00–21:00, <span className={styles.encounterNight} style={{fontSize:'0.8rem',padding:'1px 5px',borderRadius:'4px'}}>Night</span> = 21:00–4:00, <span className={styles.encounterRotation} style={{fontSize:'0.8rem',padding:'1px 5px',borderRadius:'4px'}}>Rotation</span> = changes every in-game day (~6 hrs, rotates at 21:59), <span className={styles.encounterWater} style={{fontSize:'0.8rem',padding:'1px 5px',borderRadius:'4px'}}>Water</span> = surfing/fishing.</p>
        <p><strong>Shiny Hunting:</strong> Lure boosts encounter rate by 10→15%. Abilities like Illuminate, Swarm, and Arena Trap also increase encounters.</p>
      </div>

      {data.rotationSchedule && <RotationSchedule schedule={data.rotationSchedule} />}

      <div className={styles.pokemonGrid}>
        {area.pokemon.map(p => (
          <PokemonCard
            key={p.name}
            name={p.name}
            encounterType={p.encounterType}
            catchData={data.catchData}
          />
        ))}
      </div>

      <CatchDataTable catchData={data.catchData} />
    </div>
  )
}

export default function SafariZones() {
  const [activeRegion, setActiveRegion] = useState('johto')

  useDocumentHead({
    title: 'PokeMMO Safari Zone Guide - Catch Rates, Flee Rates & Best Strategies',
    description: 'Complete PokeMMO Safari Zone guide with catch rates, flee rates, and optimal strategies for Johto and Sinnoh (Great Marsh). Find the best approach for every Safari Zone Pokemon.',
    canonicalPath: '/safari-zones',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Safari Zone Guide', url: '/safari-zones' }
    ]
  })

  return (
    <>
      <h1 className="page-title">Safari Zone Guide</h1>
      <img src={getAssetUrl('images/pagebreak.png')} alt="" className="pagebreak" />

      <div className={styles.regionTabs}>
        {REGIONS.map(r => {
          const isDisabled = !safariData[r]
          return (
            <button
              key={r}
              className={`${styles.regionTab} ${activeRegion === r ? styles.regionTabActive : ''} ${isDisabled ? styles.regionTabDisabled : ''}`}
              onClick={() => !isDisabled ? setActiveRegion(r) : null}
            >
              {REGION_LABELS[r]}
              {isDisabled && ' (Soon)'}
            </button>
          )
        })}
      </div>

      <RegionContent key={activeRegion} region={activeRegion} />
    </>
  )
}
