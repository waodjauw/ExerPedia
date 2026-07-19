<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <footer class="site-footer">
    <div class="container site-footer__inner">
      <RouterLink class="wordmark" to="/"><strong>Exer</strong><span>Pedia</span></RouterLink>
      <p>{{ t('footer.tagline') }}</p>
      <p class="site-footer__rights">{{ t('footer.rights') }} · © {{ new Date().getFullYear() }}</p>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.site-footer {
  border-top: 1px solid var(--color-border);
  padding: 38px 0 42px;
  background: var(--color-bg);
}
.site-footer__inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 20px;
}
.wordmark {
  color: var(--color-text);
  font-size: 18px;
  letter-spacing: -0.04em;
}
.wordmark strong {
  font-weight: 700;
}
.wordmark span {
  font-weight: 300;
}
p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 12px;
  letter-spacing: 0.08em;
}
.site-footer__rights {
  justify-self: end;
  color: var(--color-text-faint);
  text-align: right;
}
@media (max-width: 767px) {
  .site-footer__inner {
    grid-template-columns: 1fr;
  }
  .site-footer__rights {
    justify-self: start;
    text-align: left;
  }
}
</style>
