import { computed } from 'vue'
import { defineStore } from 'pinia'
import source from '@/data/exercises.v1.json'
import { exerciseNamesZh } from '@/data/exercise-names.zh'
import { useAppStore } from '@/stores/app'
import { useExploreStore } from '@/stores/explore'
import type { ExerciseRecord, Locale } from '@/types/exercise'

const exercises = source as ExerciseRecord[]

export const useExercisesStore = defineStore('exercises', () => {
  const app = useAppStore()
  const explore = useExploreStore()

  const all = computed(() => exercises)
  const equipment = computed(() => [...new Set(exercises.map((item) => item.equipment))].sort())
  const filtered = computed(() => {
    const query = explore.query.trim().toLocaleLowerCase()
    return exercises.filter((exercise) => {
      const matchesQuery =
        !query ||
        exercise.name.toLocaleLowerCase().includes(query) ||
        (exerciseNamesZh[exercise.id] ?? '').includes(explore.query.trim())
      const matchesFilter =
        explore.filterMode === 'bodyPart'
          ? !explore.selectedBodyPart || exercise.body_part === explore.selectedBodyPart
          : !explore.selectedEquipment || exercise.equipment === explore.selectedEquipment
      return matchesQuery && matchesFilter
    })
  })

  function byId(id: string) {
    return exercises.find((exercise) => exercise.id === id)
  }

  function name(exercise: ExerciseRecord, locale: Locale = app.locale) {
    return locale === 'zh-CN' ? (exerciseNamesZh[exercise.id] ?? exercise.name) : exercise.name
  }

  function secondaryName(exercise: ExerciseRecord, locale: Locale = app.locale) {
    return locale === 'zh-CN' ? exercise.name : (exerciseNamesZh[exercise.id] ?? exercise.name)
  }

  function steps(exercise: ExerciseRecord, locale: Locale = app.locale) {
    const key = locale === 'zh-CN' ? 'zh' : 'en'
    const localized = exercise.instruction_steps[key]
    if (localized?.length) return localized
    if (exercise.instruction_steps.en?.length) return exercise.instruction_steps.en
    return [exercise.instructions[key] ?? exercise.instructions.en].filter(Boolean)
  }

  return { all, equipment, filtered, byId, name, secondaryName, steps }
})
