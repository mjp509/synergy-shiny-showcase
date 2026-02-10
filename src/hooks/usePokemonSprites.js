import { useMemo } from 'react'
import spritesData from '../data/pokemmo_data/pokemon-sprites.json'

/**
 * Hook to get available sprites for a Pokemon
 * Returns animated shiny sprite as default, then other variants
 */
export function usePokemonSprites(pokemonName) {
  return useMemo(() => {
    if (!pokemonName) return []

    const pokemonLower = pokemonName.toLowerCase()
    const spriteData = spritesData[pokemonLower]

    if (!spriteData || !spriteData.sprites) return []

    const sprites = []
    const { animated, official } = spriteData.sprites

    // Animated Shiny (DEFAULT - comes first)
    if (animated?.shiny) {
      sprites.push({
        url: animated.shiny,
        label: 'Animated Shiny',
        type: 'gif'
      })
    }

    // Animated Normal
    if (animated?.normal) {
      sprites.push({
        url: animated.normal,
        label: 'Animated',
        type: 'gif'
      })
    }

    // Official Artwork Shiny
    if (official?.shiny) {
      sprites.push({
        url: official.shiny,
        label: 'Official Artwork Shiny',
        type: 'image'
      })
    }

    // Official Artwork Normal
    if (official?.normal) {
      sprites.push({
        url: official.normal,
        label: 'Official Artwork',
        type: 'image'
      })
    }

    return sprites
  }, [pokemonName])
}
