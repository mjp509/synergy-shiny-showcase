import { useState, useMemo, useEffect, useRef } from 'react'
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
  const [visibleCount, setVisibleCount] = useState(30)
  const loadMoreRef = useRef(null)
  const timeoutRef = useRef(null)
  const isLoadingRef = useRef(false)

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

  // Create rank map for O(1) lookup instead of O(n) findIndex on every render
  const rankMap = useMemo(() => {
    const map = new Map()
    sortedPlayers.forEach(([player], index) => {
      map.set(player, index)
    })
    return map
  }, [sortedPlayers])

  // Infinite scroll observer
  useEffect(() => {
    const element = loadMoreRef.current

    // Only set up observer if element exists and there are more items to load
    if (!element || visibleCount >= filteredPlayers.length) {
      isLoadingRef.current = false
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingRef.current) {
          isLoadingRef.current = true

          // Load more items immediately for smoother experience
          setVisibleCount(prev => {
            const newCount = prev + 30
            return Math.min(newCount, filteredPlayers.length)
          })

          // Reset loading state after a short delay
          setTimeout(() => {
            isLoadingRef.current = false
          }, 100)
        }
      },
      { threshold: 0, rootMargin: '300px' }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [visibleCount, filteredPlayers.length])

  // Reset visible count when search changes
  useEffect(() => {
    setVisibleCount(30)
    isLoadingRef.current = false
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [search])

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
        {filteredPlayers.slice(0, visibleCount).map(([player, playerData]) => (
          <PlayerCard
            key={player}
            player={player}
            data={playerData}
            rank={rankMap.get(player)}
            streamers={streamers}
          />
        ))}
      </div>

      {visibleCount < filteredPlayers.length && (
        <div ref={loadMoreRef} style={{ textAlign: 'center', margin: '30px 0', padding: '20px' }}>
          <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
            Loading more players...
          </p>
        </div>
      )}
    </div>
  )
}
