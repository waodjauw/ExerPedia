<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMediaQuery } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { fieldLabel } from '@/data/field-labels'
import { useAssetUrl } from '@/composables/useAssetUrl'
import { useAppStore } from '@/stores/app'
import { useExercisesStore } from '@/stores/exercises'
import type { ExerciseRecord } from '@/types/exercise'

const props = defineProps<{ exercise: ExerciseRecord }>()
const emit = defineEmits<{ open: [] }>()
const { t } = useI18n()
const app = useAppStore()
const { locale } = storeToRefs(app)
const exercises = useExercisesStore()
const canPreview = useMediaQuery('(hover: hover) and (pointer: fine) and (min-width: 1200px)')
const previewing = ref(false)
const imageFailed = ref(false)

const displayName = computed(() => exercises.name(props.exercise))
const secondaryName = computed(() => exercises.secondaryName(props.exercise))
const source = computed(() =>
  useAssetUrl(previewing.value ? props.exercise.gif_url : props.exercise.image),
)

function beginPreview() {
  if (canPreview.value) previewing.value = true
}
</script>

<template>
  <RouterLink
    class="exercise-card"
    :to="`/exercise/${exercise.id}`"
    :aria-label="`${t('explore.view')}：${displayName}`"
    @mouseenter="beginPreview"
    @mouseleave="previewing = false"
    @focus="beginPreview"
    @blur="previewing = false"
    @click="emit('open')"
  >
    <div class="exercise-card__media">
      <img
        v-if="!imageFailed"
        :key="source"
        :src="source"
        :alt="t(previewing ? 'detail.demonstration' : 'detail.thumbnail', { name: displayName })"
        loading="lazy"
        width="180"
        height="180"
        @error="imageFailed = true"
      />
      <div v-else class="exercise-card__fallback" aria-hidden="true">{{ exercise.id }}</div>
      <span v-if="previewing" class="exercise-card__preview">GIF PREVIEW</span>
      <span class="exercise-card__id">NO. {{ exercise.id }}</span>
    </div>
    <div class="exercise-card__content">
      <div class="exercise-card__labels">
        <span>{{ fieldLabel(exercise.body_part, locale) }}</span>
        <i aria-hidden="true"></i>
        <span>{{ fieldLabel(exercise.equipment, locale) }}</span>
      </div>
      <h2>{{ displayName }}</h2>
      <p>{{ secondaryName }}</p>
      <span class="exercise-card__arrow" aria-hidden="true">↗</span>
    </div>
  </RouterLink>
</template>

<style scoped lang="scss">
.exercise-card {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  transition:
    transform var(--motion-base) var(--ease-out),
    border-color var(--motion-fast),
    background var(--motion-fast),
    box-shadow var(--motion-base);
}
.exercise-card:hover,
.exercise-card:focus-visible {
  z-index: 1;
  border-color: var(--color-border-strong);
  background: var(--color-surface-hover);
  transform: translateY(-5px);
  box-shadow: var(--shadow-card);
}
.exercise-card:active {
  transform: scale(0.99);
}
.exercise-card__media {
  position: relative;
  aspect-ratio: 1.18;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: radial-gradient(circle at 50% 48%, #292b2f 0, #111215 56%, #0b0c0e 100%);
  border-bottom: 1px solid var(--color-border);
}
.exercise-card__media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.04),
    transparent 35%,
    rgba(0, 0, 0, 0.22)
  );
  pointer-events: none;
}
.exercise-card__media img {
  width: min(76%, 238px);
  height: min(76%, 238px);
  object-fit: contain;
  mix-blend-mode: screen;
  filter: grayscale(1) contrast(1.06);
  transition:
    transform var(--motion-slow) var(--ease-out),
    opacity var(--motion-fast);
}
.exercise-card:hover .exercise-card__media img {
  transform: scale(1.035);
}
.exercise-card__fallback {
  color: var(--color-text-faint);
  font-size: 54px;
  font-weight: 200;
  letter-spacing: -0.04em;
}
.exercise-card__id,
.exercise-card__preview {
  position: absolute;
  z-index: 2;
  top: 14px;
  padding: 6px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: rgba(7, 7, 8, 0.72);
  color: var(--color-text-faint);
  font-size: 8px;
  letter-spacing: 0.12em;
}
.exercise-card__id {
  left: 14px;
}
.exercise-card__preview {
  right: 14px;
  color: var(--color-text);
}
.exercise-card__content {
  position: relative;
  min-height: 180px;
  padding: 24px;
}
.exercise-card__labels {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--color-text-faint);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.exercise-card__labels i {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--color-text-faint);
}
h2 {
  margin: 24px 40px 8px 0;
  font-size: 21px;
  font-weight: 520;
  line-height: 1.25;
  letter-spacing: -0.025em;
}
p {
  margin: 0;
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.exercise-card__arrow {
  position: absolute;
  right: 24px;
  top: 70px;
  color: var(--color-text-faint);
  font-size: 20px;
  transition:
    color var(--motion-fast),
    transform var(--motion-fast);
}
.exercise-card:hover .exercise-card__arrow {
  color: var(--color-text);
  transform: translate(2px, -2px);
}
@media (max-width: 767px) {
  .exercise-card__content {
    min-height: 164px;
    padding: 21px;
  }
  h2 {
    font-size: 20px;
  }
  .exercise-card__media img {
    width: 70%;
    height: 70%;
  }
}
</style>
