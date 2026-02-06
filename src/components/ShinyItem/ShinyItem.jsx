import { memo, useMemo } from 'react'
import InfoBox from '../InfoBox/InfoBox'
import { getAssetUrl } from '../../utils/assets'
import styles from './ShinyItem.module.css'
import { useTierData } from '../../hooks/useTierData'

// Mapping of traits to CSS classes
const TRAIT_CLASSES = {
  Alpha: ['alphaPokemon', 'glowAlpha'],
  'Secret Shiny': ['glowPokemon'],
  Favourite: ['favouritePokemon'],
}

// Mapping of icons
const ICON_MAP = {
  'Secret Shiny': [getAssetUrl('images/Shiny Showcase/secretshiny.png'), 'secretIcon'],
  'Honey Tree': [getAssetUrl('images/Shiny Showcase/honey.png'), 'honeyIcon'],
  Egg: [getAssetUrl('images/Shiny Showcase/egg.png'), 'eggIcon'],
  Safari: [getAssetUrl('images/Shiny Showcase/safari.png'), 'safariIcon'],
  Event: [getAssetUrl('images/Shiny Showcase/event.png'), 'eventIcon'],
  MysteriousBall: [getAssetUrl('images/Shiny Showcase/mysteriousball.gif'), 'mysteriousballGif'],
  Favourite: [getAssetUrl('images/Shiny Showcase/heart.png'), 'favouriteHeart'],
}

function ShinyItem({ shiny, points }) {
  const { tierLookup } = useTierData()

  // Memoize Pokémon name and tier folder
  const { tierFolder, urlName } = useMemo(() => {
    const pokemonKey = shiny.Pokemon.toLowerCase()
    const tier = tierLookup[pokemonKey] ?? '0'
    const folder = `tier_${tier.replace(/\D/g, '')}` // "Tier 7" -> "tier_7"
    const name = pokemonKey.replace(/[^a-z0-9-]/g, '-')
    return { tierFolder: folder, urlName: name }
  }, [shiny.Pokemon, tierLookup])

  // Container CSS classes based on traits
  const containerClasses = useMemo(() => {
    const classes = [styles.gifContainer]
    Object.entries(TRAIT_CLASSES).forEach(([key, classNames]) => {
      if (shiny[key]?.toLowerCase() === 'yes') {
        classNames.forEach(c => classes.push(styles[c]))
      }
    })
    return classes.join(' ')
  }, [shiny])

  // Icons to display
  const icons = useMemo(() => {
    const iconList = []

    Object.entries(ICON_MAP).forEach(([key, [src, cls]]) => {
      if (shiny[key]?.toLowerCase() === 'yes') {
        iconList.push(
          <img
            key={key}
            src={src}
            className={styles[cls]}
            alt={key}
            loading="lazy"
          />
        )
      }
    })

    // Optional reaction icon
    let reactionUrl = shiny['Reaction Link']?.trim()
    if (reactionUrl && !/^https?:\/\//i.test(reactionUrl)) {
      reactionUrl = 'https://' + reactionUrl
    }
    if (reactionUrl) {
      iconList.push(
        <img
          key="reaction"
          src={getAssetUrl('images/Shiny Showcase/reaction.png')}
          className={styles.reactionIcon}
          alt="Reaction"
          loading="lazy"
          onClick={e => {
            e.stopPropagation()
            window.open(reactionUrl, '_blank')
          }}
        />
      )
    }

    return iconList
  }, [shiny])

  const isSold = shiny.Sold?.toLowerCase() === 'yes'

  // Local GIF path (hashed filename if imported via Webpack, otherwise public folder)
  const shinyGifPath = `/images/pokemon_gifs/${tierFolder}/${urlName}.gif`

  return (
    <span className={styles.wrapper}>
      <div className={containerClasses}>
        {icons}
        <img
          src={shinyGifPath}
          alt={shiny.Pokemon}
          className={`${styles.shinyGif} ${isSold ? styles.soldPokemon : ''}`}
          width="80"
          height="80"
          loading="lazy"
        />
        <img
          src={getAssetUrl('images/Shiny Showcase/sparkle.gif')}
          className={styles.particleGif}
          alt=""
          loading="lazy"
        />
      </div>
      <InfoBox shiny={shiny} points={points} />
    </span>
  )
}

export default memo(ShinyItem)
