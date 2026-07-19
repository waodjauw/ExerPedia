export type Locale = 'zh-CN' | 'en'
export type FilterMode = 'bodyPart' | 'equipment'

export interface ExerciseRecord {
  id: string
  name: string
  category: string
  body_part: string
  equipment: string
  instructions: Record<string, string>
  instruction_steps: Record<string, string[]>
  muscle_group: string
  secondary_muscles: string[]
  target: string
  image: string
  gif_url: string
  attribution: string
}
