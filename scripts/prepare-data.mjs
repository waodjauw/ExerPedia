import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceRoot = resolve(projectRoot, '..', 'exercises-dataset')

const selections = {
  chest: ['0025', '0047', '0289', '0314', '0308', '0662', '0151', '0577'],
  back: ['0652', '0017', '0027', '0293', '0861', '0198', '0238', '0588'],
  shoulders: ['0405', '0334', '0310', '0287', '0178', '0225', '0120', '0603'],
  'upper arms': ['0031', '0294', '0313', '0297', '0241', '0194', '0060', '0814'],
  waist: ['0001', '0274', '0276', '0472', '0687', '0872', '0464', '0972'],
  'upper legs': ['0032', '0043', '0054', '1760', '0739', '0585', '0586', '1409'],
}

const selectedIds = Object.values(selections).flat()
const records = JSON.parse(await readFile(resolve(sourceRoot, 'data', 'exercises.json'), 'utf8'))
const selected = selectedIds.map((id) => records.find((record) => record.id === id))

if (selected.some((record) => !record))
  throw new Error('One or more selected exercise IDs are missing')
if (new Set(selectedIds).size !== 48) throw new Error('V1 selection must contain 48 unique IDs')

for (const [bodyPart, ids] of Object.entries(selections)) {
  const invalid = ids.filter(
    (id) => selected.find((record) => record.id === id)?.body_part !== bodyPart,
  )
  if (invalid.length) throw new Error(`Invalid ${bodyPart} selections: ${invalid.join(', ')}`)
}

for (const record of selected) {
  if (!record.instruction_steps?.zh?.length || !record.instruction_steps?.en?.length) {
    throw new Error(`Exercise ${record.id} is missing bilingual steps`)
  }

  const imageName = record.image.split('/').at(-1)
  const gifName = record.gif_url.split('/').at(-1)
  record.image = `/assets/exercises/images/${imageName}`
  record.gif_url = `/assets/exercises/gifs/${gifName}`

  await mkdir(resolve(projectRoot, 'public', 'assets', 'exercises', 'images'), { recursive: true })
  await mkdir(resolve(projectRoot, 'public', 'assets', 'exercises', 'gifs'), { recursive: true })
  await copyFile(
    resolve(sourceRoot, 'images', imageName),
    resolve(projectRoot, 'public', 'assets', 'exercises', 'images', imageName),
  )
  await copyFile(
    resolve(sourceRoot, 'videos', gifName),
    resolve(projectRoot, 'public', 'assets', 'exercises', 'gifs', gifName),
  )
}

const compact = selected.map((record) => ({
  id: record.id,
  name: record.name,
  category: record.category,
  body_part: record.body_part,
  equipment: record.equipment,
  instructions: { zh: record.instructions.zh, en: record.instructions.en },
  instruction_steps: {
    zh: record.instruction_steps.zh,
    en: record.instruction_steps.en,
  },
  muscle_group: record.muscle_group,
  secondary_muscles: record.secondary_muscles,
  target: record.target,
  image: record.image,
  gif_url: record.gif_url,
  attribution: record.attribution,
}))

await writeFile(
  resolve(projectRoot, 'src', 'data', 'exercises.v1.json'),
  `${JSON.stringify(compact, null, 2)}\n`,
  'utf8',
)

console.log(`Prepared ${compact.length} bilingual exercises and ${compact.length * 2} media files.`)
