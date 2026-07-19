import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FilterMode } from '@/types/exercise'

export const useExploreStore = defineStore('explore', () => {
  const query = ref('')
  const filterMode = ref<FilterMode>('bodyPart')
  const selectedBodyPart = ref<string | null>(null)
  const selectedEquipment = ref<string | null>(null)
  const scrollY = ref(0)

  function setMode(mode: FilterMode) {
    filterMode.value = mode
  }

  function setBodyPart(value: string | null) {
    filterMode.value = 'bodyPart'
    selectedBodyPart.value = value
  }

  function setEquipment(value: string | null) {
    filterMode.value = 'equipment'
    selectedEquipment.value = value
  }

  function clearFilters() {
    query.value = ''
    selectedBodyPart.value = null
    selectedEquipment.value = null
  }

  return {
    query,
    filterMode,
    selectedBodyPart,
    selectedEquipment,
    scrollY,
    setMode,
    setBodyPart,
    setEquipment,
    clearFilters,
  }
})
