import { memo, useMemo } from 'react'
import InfoBox from '../InfoBox/InfoBox'
import { getAssetUrl } from '../../utils/assets'
import { getLocalPokemonGif, onGifError } from '../../utils/pokemon'
import styles from './ShinyItem.module.css'

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
  const shinyGifPath = useMemo(() => getLocalPokemonGif(shiny.Pokemon), [shiny.Pokemon])

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
          onError={onGifError(shiny.Pokemon)}
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
