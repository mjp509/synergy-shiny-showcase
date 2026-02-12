#!/usr/bin/env node
/**
 * Clean up pokemon-sprites.json
 * - Remove generation-vi, generation-vii, generation-viii
 * - Remove any generation where all sprite values are null
 * - Keep only: id, name, and sprites.versions (gen-i through gen-v, filtered)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const spritesPath = path.join(__dirname, '../src/data/pokemmo_data/pokemon-sprites.json');

// Check if all values in an object are null
function isAllNull(obj) {
    if (typeof obj !== 'object' || obj === null) return false;
    
    for (const key in obj) {
        const value = obj[key];
        if (value === null || value === undefined) continue;
        if (typeof value === 'object') {
            if (!isAllNull(value)) return false;
        } else {
            return false;
        }
    }
    return true;
}

console.log('Reading pokemon-sprites.json...');
const spritesData = JSON.parse(fs.readFileSync(spritesPath, 'utf-8'));

const cleanedData = {};
const generationsToRemove = ['generation-vi', 'generation-vii', 'generation-viii'];
let removedGenerationsCount = 0;
let removedNullGenerationsCount = 0;

Object.entries(spritesData).forEach(([pokemonName, pokemonData]) => {
    const cleanedVersions = {};
    const versions = pokemonData.sprites.versions || {};
    
    Object.entries(versions).forEach(([genName, genData]) => {
        // Skip specified generations
        if (generationsToRemove.includes(genName)) {
            removedGenerationsCount++;
            return;
        }
        
        // Check if entire generation is null
        if (isAllNull(genData)) {
            removedNullGenerationsCount++;
            return;
        }
        
        cleanedVersions[genName] = genData;
    });
    
    cleanedData[pokemonName] = {
        id: pokemonData.id,
        name: pokemonData.name,
        sprites: {
            versions: cleanedVersions
        }
    };
});

console.log('Writing cleaned pokemon-sprites.json...');
fs.writeFileSync(spritesPath, JSON.stringify(cleanedData, null, 4), 'utf-8');

console.log('✓ Successfully cleaned pokemon-sprites.json');
console.log(`✓ Processed ${Object.keys(cleanedData).length} Pokémon entries`);
console.log(`✓ Removed ${removedGenerationsCount} generation-vi/vii/viii entries`);
console.log(`✓ Removed ${removedNullGenerationsCount} null-only generations`);
