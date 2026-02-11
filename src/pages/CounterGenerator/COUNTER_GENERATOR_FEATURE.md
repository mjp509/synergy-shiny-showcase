# Counter Generator Feature Documentation

## Overview

The Counter Generator is a specialized tool that parses Pokémon GIFs, extracts individual frames, resizes them to specific dimensions, and generates XML theme files compatible with PokeMMO. The output is packaged as a ZIP file ready for game client import.

## Architecture

### Components & Files

#### 1. **CounterGenerator Page** (`src/pages/CounterGenerator/CounterGenerator.jsx`)
- Main UI component for the counter generator
- File upload interface
- Preview of parsed frames
- Download button for generated ZIP

**Key State Variables:**
```javascript
const [selectedFile, setSelectedFile] = useState(null)
const [frames, setFrames] = useState([])              // Parsed GIF frames
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
const [message, setMessage] = useState('')
```

**Key Functions:**
- `handleFileChange()` - Captures user-selected GIF file
- `handleParse()` - Triggers GIF parsing process
- `handleDownload()` - Generates and downloads ZIP package
- `handleDragDrop()` - Enables drag-and-drop file upload

#### 2. **GIF Parsing Logic** (`src/utils/`)
- Uses `omggif` library for GIF frame extraction
- Parses GIF metadata, dimensions, timing
- Each frame extracted as individual image data

**Frame Structure:**
```javascript
{
  index: 0,
  duration: 100,           // milliseconds
  imageData: CanvasImageData,
  dataUrl: "data:image/png;base64,..."
}
```

#### 3. **Image Resizing**
- Uses HTML5 Canvas API
- Resizes frames to standardized dimensions (typically 96x96 or 128x128)
- Maintains aspect ratio using canvas `drawImage()`
- Preserves transparency for PNG conversion

**Resizing Formula:**
```javascript
const canvas = document.createElement('canvas')
canvas.width = targetWidth    // e.g., 96
canvas.height = targetHeight  // e.g., 96

const ctx = canvas.getContext('2d')
ctx.drawImage(frameImage, 0, 0, targetWidth, targetHeight)
// Convert to PNG via canvas.toDataURL('image/png')
```

#### 4. **XML Generation**
- Constructs PokeMMO-compatible XML structure
- Integrates frame timings from GIF metadata
- References resized PNG frames

**XML Output Structure:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<theme>
  <frameList>
    <frame delay="100">
      <image>frame_0.png</image>
    </frame>
    <frame delay="100">
      <image>frame_1.png</image>
    </frame>
  </frameList>
</theme>
```

#### 5. **ZIP Generation**
- Uses `jszip` library to package resources
- Includes:
  - `theme.xml` - Main theme configuration
  - `frame_0.png`, `frame_1.png`, etc. - Individual frames
  - Optional: metadata.json with generation info

**ZIP Creation:**
```javascript
import JSZip from 'jszip'

const zip = new JSZip()
zip.file('theme.xml', xmlContent)
frames.forEach((frame, idx) => {
  zip.file(`frame_${idx}.png`, frame.pngBinary)
})
zip.generateAsync({ type: 'blob' })
  .then(blob => downloadFile(blob, 'counter.zip'))
```

### Data Flow

```
User Uploads GIF
        ↓
[omggif parses GIF metadata]
        ↓
For each frame:
  - Extract frame data
  - Decode to canvas
  - Resize via canvas
  - Export as PNG data
        ↓
Generate XML with frame timings
        ↓
Create ZIP package in memory
        ↓
Trigger browser download
```

## Key Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| `omggif` | 1.0.10 | GIF parsing and frame extraction |
| `jszip` | 3.10.1 | ZIP file creation in browser |
| Canvas API | Native | Image resizing and manipulation |

## How to Extend

### Adding Frame Optimization

```javascript
// Add compression before ZIP packaging
const optimizeframe = (pngDataUrl) => {
  // Convert to canvas
  // Apply compression (e.g., reduce colors)
  // Return optimized data
}
```

### Supporting Additional Formats

To support BMP, JPEG input:
1. Add format detection in file upload
2. Create format-specific parsers
3. Route to appropriate conversion path
4. Generate XML with format metadata

### Custom XML Templates

```javascript
const customXmlTemplate = (frames, theme) => {
  return `<?xml version="1.0"?>
  <theme name="${theme.name}" author="${theme.author}">
    <frameList speed="${theme.speed}">
      ${frames.map((f, i) => `<frame delay="${f.duration}"><image>frame_${i}.png</image></frame>`).join('\n')}
    </frameList>
  </theme>`
}
```

### Error Handling for Corrupted GIFs

```javascript
const parseGifSafely = async (file) => {
  try {
    const buffer = await file.arrayBuffer()
    const gif = new GIF(new Uint8Array(buffer))
    
    if (gif.numFrames() === 0) {
      throw new Error('GIF contains no frames')
    }
    
    return gif
  } catch (err) {
    throw new Error(`Failed to parse GIF: ${err.message}`)
  }
}
```

## PokeMMO Theme Format Requirements

### XML Specifications
- Root element: `<theme>`
- Frame list container: `<frameList>`
- Individual frame tags: `<frame delay="milliseconds">`
- Image reference: `<image>filename.png</image>`
- Delay in milliseconds (100 = 0.1 seconds)

### Image Requirements
- Format: PNG with transparency support
- Typical resolution: 96x96 or 128x128 pixels
- Bit depth: 32-bit (RGBA)
- Color profile: sRGB

## Performance Considerations

- **Memory Usage**: Large GIFs can consume significant memory during parsing
  - Solution: Process frames in batches if > 100 frames
  - Clear frame buffer between processing
- **Canvas Operations**: Multiple resize operations can be slow
  - Solution: Use OffscreenCanvas for worker threads
  - Cache resized frames
- **ZIP Generation**: Creating ZIP in memory is instant for most files
  - Large file warning if total > 10MB

## Common Issues & Solutions

### Issue: "GIF parsing failed" error
**Cause:** Corrupted GIF file or unsupported format (animated WEBP, etc.)
**Solution:** 
- Validate GIF header bytes (should start with `GIF89a` or `GIF87a`)
- Re-export GIF from image editor
- Try online GIF repair tool

### Issue: Frames appear distorted after resize
**Cause:** Incorrect canvas dimensions or aspect ratio not preserved
**Solution:**
```javascript
// Preserve aspect ratio during resize
const scale = Math.min(targetWidth / originalWidth, targetHeight / originalHeight)
ctx.drawImage(img, 0, 0, originalWidth * scale, originalHeight * scale)
```

### Issue: Downloaded ZIP is empty or corrupt
**Cause:** Stream not properly terminated before download
**Solution:**
```javascript
zip.generateAsync({ type: 'blob' }).then(blob => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'counter.zip'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 100)
})
```

### Issue: XML not recognized by PokeMMO
**Cause:** Incorrect tag structure or encoding
**Solution:**
- Ensure XML declaration: `<?xml version="1.0" encoding="UTF-8"?>`
- Validate XML structure with `xmllint` or online validator
- Check frame filenames match image references exactly

## Testing Checklist

- [ ] Small GIF (< 10MB) uploads successfully
- [ ] Large GIF (> 50MB) shows progress indicator
- [ ] Frame preview displays all parsed frames
- [ ] Frame count matches GIF metadata
- [ ] Downloaded ZIP extracts without corruption
- [ ] Generated XML is valid and parseable
- [ ] Theme.xml references correct image files
- [ ] All frame PNG files included in ZIP
- [ ] Images maintain transparency
- [ ] Animations play correctly in PokeMMO

## Related Features

- **Pokémon Detail**: Uses same GIF parsing for legendary Pokemon fallback
- **Shiny Showcase**: Powers custom Shiny counter display themes
