import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Locale } from '@/types/exercise'

export const useAppStore = defineStore('app', () => {
  const saved = localStorage.getItem('exerpedia-locale')
  const locale = ref<Locale>(saved === 'en' ? 'en' : 'zh-CN')

  function setLocale(value: Locale) {
    locale.value = value
    localStorage.setItem('exerpedia-locale', value)
    document.documentElement.lang = value
  }

  function toggleLocale() {
    setLocale(locale.value === 'zh-CN' ? 'en' : 'zh-CN')
  }

  return { locale, setLocale, toggleLocale }
})
