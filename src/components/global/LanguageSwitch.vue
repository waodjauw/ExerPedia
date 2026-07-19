<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'

const app = useAppStore()
const { locale } = storeToRefs(app)
</script>

<template>
  <button
    class="language-switch"
    type="button"
    :aria-label="locale === 'zh-CN' ? 'Switch to English' : '切换到中文'"
    @click="app.toggleLocale"
  >
    <span :class="{ active: locale === 'zh-CN' }">中</span>
    <span class="language-switch__divider" aria-hidden="true"></span>
    <span :class="{ active: locale === 'en' }">EN</span>
  </button>
</template>

<style scoped lang="scss">
.language-switch {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.035);
  color: var(--color-text-faint);
  font: 600 11px/1 var(--font-sans);
  letter-spacing: 0.08em;
  cursor: pointer;
  transition:
    border-color var(--motion-fast),
    background var(--motion-fast);

  &:hover {
    border-color: var(--color-border-strong);
    background: var(--color-glass-strong);
  }
  .active {
    color: var(--color-text);
  }
}

.language-switch__divider {
  width: 1px;
  height: 12px;
  background: var(--color-border-strong);
}
</style>
