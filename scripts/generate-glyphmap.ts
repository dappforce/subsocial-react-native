//////////////////////////////////////////////////////////////////////
// Generate Glyphmap from Fontello Font Config
// See https://fontello.com
import * as fs from 'fs/promises'
import * as path from 'path'

type Glyph = {
  code: number
  css: string
}

(async() => {
  if (process.argv.length < 3) {
    console.error('Please specify path to fontello font config')
    return
  }
  
  const configPath = path.resolve(__dirname, process.argv[2])
  const dir = path.dirname(configPath)
  const json = JSON.parse(await fs.readFile(configPath, { encoding: 'utf8' }))
  
  const glyphs = json.glyphs as Glyph[]
  const result: Record<string, number> = {}
  
  glyphs.forEach(g => {result[g.css] = g.code})
  
  await fs.writeFile(path.join(dir, 'subicons.glyphmap.json'), JSON.stringify(result, null, 2), { encoding: 'utf8' })
})();
