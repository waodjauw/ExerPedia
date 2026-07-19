<script setup lang="ts">
import { computed, nextTick, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { onBeforeRouteLeave } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ExerciseCard from '@/components/explore/ExerciseCard.vue'
import { bodyParts, fieldLabel } from '@/data/field-labels'
import { useAppStore } from '@/stores/app'
import { useExploreStore } from '@/stores/explore'
import { useExercisesStore } from '@/stores/exercises'

const { t } = useI18n()
const app = useAppStore()
const explore = useExploreStore()
const exercises = useExercisesStore()
const { locale } = storeToRefs(app)
const { query, filterMode, selectedBodyPart, selectedEquipment } = storeToRefs(explore)
const { equipment, filtered } = storeToRefs(exercises)

const activeFilter = computed(() =>
  filterMode.value === 'bodyPart' ? selectedBodyPart.value : selectedEquipment.value,
)
const summary = computed(() => {
  const parts = [
    activeFilter.value ? fieldLabel(activeFilter.value, locale.value) : t('explore.summaryAll'),
  ]
  if (query.value.trim()) parts.push(t('explore.summarySearch', { query: query.value.trim() }))
  parts.push(t('explore.count', { count: filtered.value.length }))
  return parts.join(' · ')
})

function selectFilter(value: string | null) {
  if (filterMode.value === 'bodyPart') explore.setBodyPart(value)
  else explore.setEquipment(value)
}

function saveScroll() {
  explore.scrollY = window.scrollY
}

onBeforeRouteLeave((_to, _from, next) => {
  saveScroll()
  next()
})

onMounted(async () => {
  if (!explore.scrollY) return
  await nextTick()
  requestAnimationFrame(() => window.scrollTo({ top: explore.scrollY, behavior: 'auto' }))
})
</script>

<template>
  <div class="explore-view">
    <header class="explore-hero">
      <div class="container explore-hero__inner">
        <div>
          <p class="eyebrow">{{ t('explore.eyebrow') }}</p>
          <h1>{{ t('explore.title') }}</h1>
        </div>
        <p>{{ t('explore.intro') }}</p>
        <div class="explore-hero__count">
          <strong>{{ filtered.length }}</strong
          ><span>/ 48</span>
        </div>
      </div>
    </header>

    <section class="explore-content container" aria-labelledby="explore-tools-title">
      <h2 id="explore-tools-title" class="sr-only">{{ t('explore.filterLabel') }}</h2>
      <div class="explore-toolbar">
        <label class="search-field">
          <span class="sr-only">{{ t('explore.searchLabel') }}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 5 5" />
          </svg>
          <input
            v-model="query"
            type="search"
            :placeholder="t('explore.searchPlaceholder')"
            autocomplete="off"
          />
          <button v-if="query" type="button" :aria-label="t('common.clear')" @click="query = ''">
            ×
          </button>
        </label>

        <div class="mode-segment" role="group" :aria-label="t('explore.filterLabel')">
          <button
            type="button"
            :class="{ active: filterMode === 'bodyPart' }"
            :aria-pressed="filterMode === 'bodyPart'"
            @click="explore.setMode('bodyPart')"
          >
            {{ t('explore.modeBody') }}
          </button>
          <button
            type="button"
            :class="{ active: filterMode === 'equipment' }"
            :aria-pressed="filterMode === 'equipment'"
            @click="explore.setMode('equipment')"
          >
            {{ t('explore.modeEquipment') }}
          </button>
        </div>
      </div>

      <div class="filter-chips" role="group" :aria-label="t('explore.filterLabel')">
        <button
          type="button"
          :class="{ active: !activeFilter }"
          :aria-pressed="!activeFilter"
          @click="selectFilter(null)"
        >
          {{ t('common.all') }}
        </button>
        <button
          v-for="value in filterMode === 'bodyPart' ? bodyParts : equipment"
          :key="value"
          type="button"
          :class="{ active: activeFilter === value }"
          :aria-pressed="activeFilter === value"
          @click="selectFilter(value)"
        >
          {{ fieldLabel(value, locale) }}
        </button>
      </div>

      <div class="results-heading" aria-live="polite">
        <p>{{ summary }}</p>
        <button v-if="query || activeFilter" type="button" @click="explore.clearFilters">
          {{ t('common.clear') }} <span aria-hidden="true">×</span>
        </button>
      </div>

      <div v-if="filtered.length" class="exercise-grid">
        <ExerciseCard
          v-for="exercise in filtered"
          :key="exercise.id"
          :exercise="exercise"
          @open="saveScroll"
        />
      </div>
      <div v-else class="empty-state" role="status">
        <div class="empty-state__mark" aria-hidden="true">Ø</div>
        <h2>{{ t('explore.emptyTitle') }}</h2>
        <p>{{ t('explore.emptyText') }}</p>
        <button class="button button--ghost" type="button" @click="explore.clearFilters">
          {{ t('common.clear') }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.explore-view {
  min-height: 100vh;
  padding-bottom: 140px;
  background: linear-gradient(180deg, var(--color-bg-secondary), var(--color-bg) 50%);
}
.explore-hero {
  padding: 176px 0 84px;
  border-bottom: 1px solid var(--color-border);
}
.explore-hero__inner {
  display: grid;
  grid-template-columns: 1fr minmax(280px, 410px) auto;
  align-items: end;
  gap: 64px;
}
.explore-hero h1 {
  margin: 0;
  font-size: clamp(58px, 6vw, 82px);
  font-weight: 520;
  line-height: 0.98;
  letter-spacing: -0.065em;
}
.explore-hero__inner > p {
  margin: 0 0 6px;
  color: var(--color-text-muted);
  font-size: 16px;
  line-height: 1.75;
}
.explore-hero__count {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-bottom: -7px;
}
.explore-hero__count strong {
  font-size: 54px;
  font-weight: 300;
  letter-spacing: -0.05em;
}
.explore-hero__count span {
  color: var(--color-text-faint);
  font-size: 12px;
}
.explore-content {
  padding-top: 54px;
}
.explore-toolbar {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  align-items: center;
}
.search-field {
  min-height: 58px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 18px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-glass);
  transition:
    border-color var(--motion-fast),
    box-shadow var(--motion-fast);
}
.search-field:focus-within {
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-focus);
}
.search-field svg {
  width: 21px;
  flex: 0 0 auto;
  fill: none;
  stroke: var(--color-text-muted);
  stroke-width: 1.5;
}
.search-field input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-text);
  font-size: 15px;
}
.search-field input::placeholder {
  color: var(--color-text-faint);
}
.search-field button {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 23px;
  cursor: pointer;
}
.search-field button:hover {
  background: var(--color-glass-strong);
  color: var(--color-text);
}
.mode-segment {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-secondary);
}
.mode-segment button {
  min-width: 118px;
  min-height: 48px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 13px;
  cursor: pointer;
  transition:
    background var(--motion-fast),
    color var(--motion-fast);
}
.mode-segment button.active {
  background: var(--color-glass-strong);
  color: var(--color-text);
  box-shadow: inset 0 0 0 1px var(--color-border);
}
.filter-chips {
  display: flex;
  gap: 9px;
  padding: 26px 0 30px;
  overflow-x: auto;
  scrollbar-width: none;
}
.filter-chips::-webkit-scrollbar {
  display: none;
}
.filter-chips button {
  min-width: max-content;
  min-height: 44px;
  padding: 0 17px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 12px;
  cursor: pointer;
  transition:
    background var(--motion-fast),
    border-color var(--motion-fast),
    color var(--motion-fast),
    transform var(--motion-fast);
}
.filter-chips button:hover {
  border-color: var(--color-border-strong);
  color: var(--color-text);
}
.filter-chips button.active {
  border-color: var(--color-text);
  background: var(--color-text);
  color: var(--color-bg);
  font-weight: 650;
}
.results-heading {
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-top: 1px solid var(--color-border);
}
.results-heading p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 12px;
  letter-spacing: 0.04em;
}
.results-heading button {
  min-height: 44px;
  border: 0;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 12px;
  cursor: pointer;
}
.results-heading button:hover {
  color: var(--color-text);
}
.exercise-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}
.empty-state {
  min-height: 470px;
  display: grid;
  place-items: center;
  align-content: center;
  text-align: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-glass);
}
.empty-state__mark {
  margin-bottom: 18px;
  color: var(--color-text-faint);
  font-size: 72px;
  font-weight: 200;
}
.empty-state h2 {
  margin: 0;
  font-size: 30px;
  font-weight: 520;
}
.empty-state p {
  margin: 14px 0 28px;
  color: var(--color-text-muted);
}

@media (min-width: 1500px) {
  .exercise-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (max-width: 1000px) {
  .explore-hero__inner {
    grid-template-columns: 1fr auto;
    gap: 32px;
  }
  .explore-hero__inner > p {
    grid-row: 2;
    max-width: 500px;
  }
  .explore-hero__count {
    grid-column: 2;
    grid-row: 1 / span 2;
  }
  .exercise-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 767px) {
  .explore-view {
    padding-bottom: 90px;
  }
  .explore-hero {
    padding: 128px 0 56px;
  }
  .explore-hero__inner {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .explore-hero__inner > p {
    grid-row: auto;
  }
  .explore-hero__count {
    grid-column: auto;
    grid-row: auto;
  }
  .explore-hero__count strong {
    font-size: 38px;
  }
  .explore-content {
    padding-top: 32px;
  }
  .explore-toolbar {
    grid-template-columns: 1fr;
  }
  .mode-segment button {
    min-width: 0;
  }
  .filter-chips {
    margin-inline: -16px;
    padding-inline: 16px;
  }
  .exercise-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .results-heading {
    align-items: flex-start;
    padding: 14px 0;
  }
  .results-heading p {
    line-height: 1.6;
  }
}
</style>
