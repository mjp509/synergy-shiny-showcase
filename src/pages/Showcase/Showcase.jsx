import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDatabase } from '../../hooks/useDatabase'
import PlayerCard from '../../components/PlayerCard/PlayerCard'
import SearchBar from '../../components/SearchBar/SearchBar'
import { getAssetUrl } from '../../utils/assets'
import styles from './Showcase.module.css'

export default function Showcase() {
  const { data, isLoading, error } = useDatabase()
  const [search, setSearch] = useState('')
  const [streamers, setStreamers] = useState(null)
  const [visibleCount, setVisibleCount] = useState(10)

  // Fetch streamers on first load
  useMemo(() => {
    if (!streamers) {
      fetch('https://adminpage.hypersmmo.workers.dev/admin/streamers')
        .then(r => r.json())
        .then(setStreamers)
        .catch(() => setStreamers({}))
    }
  }, [streamers])

  const sortedPlayers = useMemo(() => {
    if (!data) return []
    return Object.entries(data)
      .sort((a, b) => b[1].shiny_count - a[1].shiny_count)
  }, [data])

  const filteredPlayers = useMemo(() => {
    if (!search) return sortedPlayers
    const lower = search.toLowerCase()
    return sortedPlayers.filter(([name]) => name.toLowerCase().includes(lower))
  }, [sortedPlayers, search])

  if (isLoading) return <div className="message">Loading...</div>
  if (error) return <div className="message">Error loading data</div>

  return (
    <div>
      <h1>
        Team Synergy Shiny Showcase
        <Link to="/admin" className="invisible-link">!</Link>
      </h1>

      <img src={getAssetUrl('images/pagebreak.png')} alt="Page Break" className="pagebreak" />

      <div className={styles.videoContainer}>
        <h2>
          <a href="https://www.youtube.com/watch?v=ngejc1FMWqg" target="_blank" rel="noopener noreferrer">
            Watch our Shiny Showcase Video!
          </a>
        </h2>
        <a href="https://www.youtube.com/watch?v=ngejc1FMWqg" target="_blank" rel="noopener noreferrer">
          <img
            src={getAssetUrl('images/shinyshowcase.png')}
            alt="Shiny Showcase Video"
            className={styles.showcaseVideo}
            width="300"
            height="169"
            loading="eager"
            decoding="async"
          />
        </a>
      </div>

      <SearchBar value={search} onChange={setSearch} />

      <div className={styles.showcase}>
        {filteredPlayers.slice(0, visibleCount).map(([player, playerData], index) => {
          const originalIndex = sortedPlayers.findIndex(([p]) => p === player)
          return (
            <PlayerCard
              key={player}
              player={player}
              data={playerData}
              rank={originalIndex}
              streamers={streamers}
            />
          )
        })}
      </div>

      {visibleCount < filteredPlayers.length && (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <button
            onClick={() => setVisibleCount(prev => prev + 10)}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#fff',
              background: 'linear-gradient(135deg, #9b59b6, #8e44ad)',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.05)'
              e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)'
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)'
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            Load More Players ({filteredPlayers.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  )
}
