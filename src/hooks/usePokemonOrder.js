import { useMemo } from 'react'
import generationData from '../data/generation.json'

/**
 * Creates a flat, ordered list of all Pokemon from generation data
 * Returns object with all pokemon names and helper functions for navigation
 */
export function usePokemonOrder() {
  return useMemo(() => {
    // Flatten all pokemon from generation data into a single ordered array
    const allPokemon = []
    
    Object.values(generationData).forEach(generationArray => {
      generationArray.forEach(evolutionLine => {
        evolutionLine.forEach(pokemonName => {
          if (!allPokemon.includes(pokemonName)) {
            allPokemon.push(pokemonName)
          }
        })
      })
    })

    // Find index of a pokemon
    const getPokemonIndex = (pokemonName) => {
      return allPokemon.findIndex(p => p.toLowerCase() === pokemonName.toLowerCase())
    }

    // Get next pokemon in order
    const getNextPokemon = (pokemonName) => {
      const currentIndex = getPokemonIndex(pokemonName)
      if (currentIndex === -1 || currentIndex === allPokemon.length - 1) return null
      return allPokemon[currentIndex + 1]
    }

    // Get previous pokemon in order
    const getPreviousPokemon = (pokemonName) => {
      const currentIndex = getPokemonIndex(pokemonName)
      if (currentIndex <= 0) return null
      return allPokemon[currentIndex - 1]
    }

    return {
      allPokemon,
      getPokemonIndex,
      getNextPokemon,
      getPreviousPokemon,
    }
  }, [])
}
