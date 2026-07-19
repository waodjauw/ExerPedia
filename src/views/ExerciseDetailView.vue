<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ExerciseMedia from '@/components/exercise/ExerciseMedia.vue'
import { fieldLabel } from '@/data/field-labels'
import { useAppStore } from '@/stores/app'
import { useExercisesStore } from '@/stores/exercises'

const route = useRoute()
const { t } = useI18n()
const app = useAppStore()
const { locale } = storeToRefs(app)
const exercises = useExercisesStore()

const exercise = computed(() => exercises.byId(String(route.params.id)))
const displayName = computed(() => (exercise.value ? exercises.name(exercise.value) : ''))
const secondaryName = computed(() =>
  exercise.value ? exercises.secondaryName(exercise.value) : '',
)
const steps = computed(() => (exercise.value ? exercises.steps(exercise.value) : []))
</script>

<template>
  <div v-if="exercise" class="detail-view">
    <section class="detail-hero container">
      <RouterLink class="back-link" to="/explore"
        ><span aria-hidden="true">←</span>{{ t('common.back') }}</RouterLink
      >
      <div class="detail-grid">
        <ExerciseMedia :exercise="exercise" :name="displayName" />

        <div class="detail-summary">
          <div class="detail-summary__index">EXERCISE / {{ exercise.id }}</div>
          <h1>{{ displayName }}</h1>
          <p class="detail-summary__secondary">{{ secondaryName }}</p>
          <div class="detail-tags">
            <span>{{ fieldLabel(exercise.body_part, locale) }}</span>
            <span>{{ fieldLabel(exercise.equipment, locale) }}</span>
            <span>{{ fieldLabel(exercise.target, locale) }}</span>
          </div>

          <dl class="detail-facts">
            <div>
              <dt>{{ t('detail.bodyPart') }}</dt>
              <dd>{{ fieldLabel(exercise.body_part, locale) }}</dd>
            </div>
            <div>
              <dt>{{ t('detail.equipment') }}</dt>
              <dd>{{ fieldLabel(exercise.equipment, locale) }}</dd>
            </div>
            <div>
              <dt>{{ t('detail.target') }}</dt>
              <dd>{{ fieldLabel(exercise.target, locale) }}</dd>
            </div>
            <div>
              <dt>{{ t('detail.muscleGroup') }}</dt>
              <dd>{{ fieldLabel(exercise.muscle_group, locale) }}</dd>
            </div>
            <div class="detail-facts__wide">
              <dt>{{ t('detail.secondary') }}</dt>
              <dd>
                {{
                  exercise.secondary_muscles.length
                    ? exercise.secondary_muscles.map((item) => fieldLabel(item, locale)).join(' · ')
                    : '—'
                }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <section class="steps-section">
      <div class="container steps-section__grid">
        <div class="steps-section__heading">
          <p class="eyebrow">{{ t('detail.stepsEyebrow') }}</p>
          <h2 class="section-title">{{ t('detail.stepsTitle') }}</h2>
        </div>
        <ol class="steps-list">
          <li v-for="(step, index) in steps" :key="index">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <p>{{ step }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="detail-notices container">
      <aside class="safety-notice">
        <div class="safety-notice__icon" aria-hidden="true">!</div>
        <div>
          <h2>{{ t('detail.safetyTitle') }}</h2>
          <p>{{ t('detail.safety') }}</p>
        </div>
      </aside>
      <div class="attribution">
        <span>{{ t('detail.attribution') }}</span>
        <a href="https://gymvisual.com/" target="_blank" rel="noopener noreferrer"
          >© Gym visual — https://gymvisual.com/ ↗</a
        >
      </div>
    </section>
  </div>

  <div v-else class="missing-exercise">
    <div class="missing-exercise__code" aria-hidden="true">404</div>
    <p class="eyebrow">EXERCISE NOT FOUND</p>
    <h1>{{ t('notFound.title') }}</h1>
    <p>{{ t('notFound.text') }}</p>
    <div>
      <RouterLink class="button" to="/explore">{{ t('nav.explore') }}</RouterLink
      ><RouterLink class="button button--ghost" to="/">{{ t('common.home') }}</RouterLink>
    </div>
  </div>
</template>

<style scoped lang="scss">
.detail-view {
  padding: 128px 0 140px;
  background: linear-gradient(180deg, var(--color-bg-secondary), var(--color-bg) 52%);
}
.back-link {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
  color: var(--color-text-muted);
  font-size: 12px;
  letter-spacing: 0.05em;
  transition:
    color var(--motion-fast),
    transform var(--motion-fast);
}
.back-link:hover {
  color: var(--color-text);
  transform: translateX(-3px);
}
.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(380px, 0.92fr);
  gap: clamp(40px, 7vw, 92px);
  align-items: center;
}
.detail-summary__index {
  color: var(--color-text-faint);
  font-size: 10px;
  letter-spacing: 0.18em;
}
.detail-summary h1 {
  margin: 26px 0 12px;
  font-size: clamp(48px, 5.5vw, 76px);
  font-weight: 520;
  line-height: 1.02;
  letter-spacing: -0.06em;
}
.detail-summary__secondary {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 16px;
  line-height: 1.5;
  text-transform: capitalize;
}
.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 30px 0 42px;
}
.detail-tags span {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  color: var(--color-silver);
  font-size: 10px;
  letter-spacing: 0.06em;
}
.detail-facts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  margin: 0;
  border-top: 1px solid var(--color-border);
}
.detail-facts > div {
  min-height: 94px;
  padding: 20px 16px 18px 0;
  border-bottom: 1px solid var(--color-border);
}
.detail-facts > div:nth-child(2n) {
  padding-left: 20px;
  border-left: 1px solid var(--color-border);
}
.detail-facts > .detail-facts__wide {
  grid-column: 1 / -1;
  padding-left: 0;
  border-left: 0;
}
.detail-facts dt {
  margin-bottom: 10px;
  color: var(--color-text-faint);
  font-size: 9px;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}
.detail-facts dd {
  margin: 0;
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.5;
}
.steps-section {
  margin-top: 150px;
  padding: 130px 0;
  border-block: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
}
.steps-section__grid {
  display: grid;
  grid-template-columns: 0.75fr 1.25fr;
  gap: clamp(60px, 10vw, 140px);
  align-items: start;
}
.steps-section__heading {
  position: sticky;
  top: 120px;
}
.steps-list {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--color-border);
}
.steps-list li {
  display: grid;
  grid-template-columns: 50px 1fr;
  gap: 22px;
  padding: 28px 0;
  border-bottom: 1px solid var(--color-border);
}
.steps-list span {
  padding-top: 3px;
  color: var(--color-text-faint);
  font-size: 10px;
  letter-spacing: 0.12em;
}
.steps-list p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 16px;
  line-height: 1.8;
}
.detail-notices {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 20px;
  padding-top: 72px;
}
.safety-notice,
.attribution {
  min-height: 155px;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 28px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-glass);
}
.safety-notice__icon {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border: 1px solid var(--color-border-strong);
  border-radius: 50%;
  color: var(--color-text);
}
.safety-notice h2 {
  margin: 2px 0 9px;
  font-size: 15px;
}
.safety-notice p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.7;
}
.attribution {
  flex-direction: column;
  justify-content: center;
  gap: 14px;
}
.attribution span {
  color: var(--color-text-faint);
  font-size: 10px;
  letter-spacing: 0.12em;
}
.attribution a {
  color: var(--color-text);
  font-size: 13px;
  text-decoration: underline;
  text-underline-offset: 5px;
}
.missing-exercise {
  min-height: 90vh;
  display: grid;
  justify-items: center;
  align-content: center;
  padding: 140px 20px 80px;
  text-align: center;
  overflow: hidden;
}
.missing-exercise__code {
  position: absolute;
  color: rgba(255, 255, 255, 0.025);
  font-size: min(40vw, 500px);
  font-weight: 700;
  letter-spacing: -0.12em;
}
.missing-exercise h1 {
  position: relative;
  max-width: 700px;
  margin: 0;
  font-size: clamp(42px, 7vw, 76px);
  letter-spacing: -0.055em;
}
.missing-exercise > p:not(.eyebrow) {
  position: relative;
  color: var(--color-text-muted);
}
.missing-exercise > div:last-child {
  position: relative;
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

@media (max-width: 1000px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .detail-summary {
    max-width: 700px;
  }
  .steps-section__grid {
    grid-template-columns: 1fr;
  }
  .steps-section__heading {
    position: static;
  }
}
@media (max-width: 767px) {
  .detail-view {
    padding: 100px 0 90px;
  }
  .detail-grid {
    gap: 46px;
  }
  .detail-summary h1 {
    font-size: 46px;
  }
  .detail-facts {
    grid-template-columns: 1fr;
  }
  .detail-facts > div,
  .detail-facts > div:nth-child(2n) {
    padding-left: 0;
    border-left: 0;
  }
  .detail-facts > .detail-facts__wide {
    grid-column: auto;
  }
  .steps-section {
    margin-top: 90px;
    padding: 90px 0;
  }
  .steps-list li {
    grid-template-columns: 36px 1fr;
    gap: 12px;
  }
  .steps-list p {
    font-size: 15px;
  }
  .detail-notices {
    grid-template-columns: 1fr;
    padding-top: 48px;
  }
  .missing-exercise > div:last-child {
    flex-direction: column;
  }
}
</style>
