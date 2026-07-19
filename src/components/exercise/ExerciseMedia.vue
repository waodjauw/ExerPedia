<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAssetUrl } from '@/composables/useAssetUrl'
import { useReducedMotion } from '@/composables/useReducedMotion'
import type { ExerciseRecord } from '@/types/exercise'

const props = defineProps<{ exercise: ExerciseRecord; name: string }>()
const { t } = useI18n()
const reducedMotion = useReducedMotion()
const playing = ref(!reducedMotion.value)
const loaded = ref(false)
const gifFailed = ref(false)

const mediaSource = computed(() =>
  useAssetUrl(playing.value && !gifFailed.value ? props.exercise.gif_url : props.exercise.image),
)

watch(
  () => props.exercise.id,
  () => {
    loaded.value = false
    gifFailed.value = false
    playing.value = !reducedMotion.value
  },
)

function togglePlayback() {
  if (gifFailed.value) return
  loaded.value = false
  playing.value = !playing.value
}

function onError() {
  if (playing.value) {
    gifFailed.value = true
    playing.value = false
    loaded.value = false
  }
}
</script>

<template>
  <div class="exercise-media">
    <div v-if="!loaded" class="exercise-media__skeleton" aria-hidden="true"></div>
    <img
      :key="mediaSource"
      :src="mediaSource"
      :alt="t(playing ? 'detail.demonstration' : 'detail.thumbnail', { name })"
      width="180"
      height="180"
      @load="loaded = true"
      @error="onError"
    />
    <div class="exercise-media__index" aria-hidden="true">{{ exercise.id }}</div>
    <button
      class="exercise-media__control"
      type="button"
      :disabled="gifFailed"
      :aria-label="t(playing ? 'detail.pause' : 'detail.play')"
      @click="togglePlayback"
    >
      <svg v-if="playing" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6v12M16 6v12" /></svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 9 6-9 6Z" /></svg>
      <span>{{ t(playing ? 'detail.pause' : 'detail.play') }}</span>
    </button>
    <p v-if="gifFailed" class="exercise-media__error" role="status">{{ t('detail.failed') }}</p>
  </div>
</template>

<style scoped lang="scss">
.exercise-media {
  position: relative;
  min-height: 600px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: radial-gradient(circle at 50% 45%, #303237 0, #151619 44%, #0b0c0e 78%);
}
.exercise-media::before,
.exercise-media::after {
  content: '';
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}
.exercise-media::before {
  width: 72%;
  aspect-ratio: 1;
}
.exercise-media::after {
  width: 50%;
  aspect-ratio: 1;
}
.exercise-media img {
  position: relative;
  z-index: 2;
  width: min(58%, 320px);
  height: auto;
  aspect-ratio: 1;
  object-fit: contain;
  mix-blend-mode: screen;
  filter: grayscale(1) contrast(1.08);
  image-rendering: auto;
}
.exercise-media__skeleton {
  position: absolute;
  z-index: 1;
  width: min(58%, 320px);
  aspect-ratio: 1;
  border-radius: 18px;
  background: linear-gradient(
    105deg,
    rgba(255, 255, 255, 0.025) 25%,
    rgba(255, 255, 255, 0.08) 38%,
    rgba(255, 255, 255, 0.025) 55%
  );
  background-size: 200% 100%;
  animation: shimmer 1.3s linear infinite;
}
.exercise-media__index {
  position: absolute;
  right: 24px;
  top: 18px;
  color: rgba(255, 255, 255, 0.055);
  font-size: clamp(80px, 10vw, 150px);
  font-weight: 200;
  letter-spacing: -0.08em;
}
.exercise-media__control {
  position: absolute;
  z-index: 3;
  left: 24px;
  bottom: 24px;
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-pill);
  background: rgba(7, 7, 8, 0.72);
  color: var(--color-text);
  cursor: pointer;
  backdrop-filter: blur(10px);
}
.exercise-media__control:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.exercise-media__control svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
}
.exercise-media__control span {
  font-size: 12px;
}
.exercise-media__error {
  position: absolute;
  z-index: 3;
  right: 24px;
  bottom: 26px;
  max-width: 270px;
  margin: 0;
  color: var(--color-text-muted);
  font-size: 11px;
  text-align: right;
  line-height: 1.5;
}
@keyframes shimmer {
  to {
    background-position-x: -200%;
  }
}
@media (max-width: 767px) {
  .exercise-media {
    min-height: 430px;
    border-radius: var(--radius-md);
  }
  .exercise-media img {
    width: 62%;
  }
  .exercise-media__control {
    left: 16px;
    bottom: 16px;
  }
  .exercise-media__error {
    display: none;
  }
}
</style>
