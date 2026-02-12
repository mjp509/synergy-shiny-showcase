const fs = require('fs');
const path = require('path');

// Read pokemon-sprites.json
const spritePath = path.join(__dirname, 'src/data/pokemmo_data/pokemon-sprites.json');
const spriteData = JSON.parse(fs.readFileSync(spritePath, 'utf-8'));

// Create a mapping of base pokemon names to their IDs
const baseIdMap = {};

// First pass: collect all base pokemon IDs (those without hyphens in the name)
Object.entries(spriteData).forEach(([name, data]) => {
  if (!name.includes('-')) {
    baseIdMap[name] = data.id;
  }
});

console.log(`Found ${Object.keys(baseIdMap).length} base pokemon`);

// Second pass: update all form IDs to match their base pokemon
let updateCount = 0;
Object.entries(spriteData).forEach(([name, data]) => {
  if (name.includes('-')) {
    // Extract base form (everything before the first hyphen)
    const baseName = name.split('-')[0];
    if (baseIdMap[baseName]) {
      const baseId = baseIdMap[baseName];
      if (data.id !== baseId) {
        console.log(`Updating ${name} from ID ${data.id} to ${baseId}`);
        data.id = baseId;
        updateCount++;
      }
    }
  }
});

console.log(`Updated ${updateCount} form entries`);

// Write back to file
fs.writeFileSync(spritePath, JSON.stringify(spriteData, null, 4));
console.log('Successfully wrote updated pokemon-sprites.json');
