<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <section class="not-found">
    <div class="not-found__number" aria-hidden="true">404</div>
    <div class="not-found__content">
      <p class="eyebrow">PAGE NOT FOUND</p>
      <h1>{{ t('notFound.title') }}</h1>
      <p>{{ t('notFound.text') }}</p>
      <div class="not-found__actions">
        <RouterLink class="button" to="/explore">{{ t('nav.explore') }}</RouterLink>
        <RouterLink class="button button--ghost" to="/">{{ t('common.home') }}</RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.not-found {
  position: relative;
  min-height: 92vh;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 130px 20px 80px;
  text-align: center;
  background: radial-gradient(circle at 50% 50%, #18191c, var(--color-bg) 54%);
}
.not-found__number {
  position: absolute;
  color: rgba(255, 255, 255, 0.025);
  font-size: min(40vw, 500px);
  font-weight: 700;
  letter-spacing: -0.12em;
}
.not-found__content {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
}
h1 {
  max-width: 760px;
  margin: 0;
  font-size: clamp(48px, 7vw, 86px);
  font-weight: 520;
  line-height: 1;
  letter-spacing: -0.06em;
}
.not-found__content > p:not(.eyebrow) {
  max-width: 520px;
  margin: 25px 0 0;
  color: var(--color-text-muted);
  line-height: 1.7;
}
.not-found__actions {
  display: flex;
  gap: 12px;
  margin-top: 36px;
}
@media (max-width: 520px) {
  .not-found__actions {
    width: 100%;
    flex-direction: column;
  }
}
</style>
