<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitch from './LanguageSwitch.vue'

const { t } = useI18n()
const route = useRoute()
const scrolled = ref(false)
const menuOpen = ref(false)

function updateScroll() {
  scrolled.value = window.scrollY > 24
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') menuOpen.value = false
}

watch(
  () => route.fullPath,
  () => (menuOpen.value = false),
)
onMounted(() => {
  updateScroll()
  window.addEventListener('scroll', updateScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScroll)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <header class="site-header" :class="{ 'site-header--scrolled': scrolled || menuOpen }">
    <div class="site-header__inner container">
      <RouterLink class="wordmark" to="/" aria-label="ExerPedia 首页"
        ><strong>Exer</strong><span>Pedia</span></RouterLink
      >

      <nav class="desktop-nav" aria-label="主导航">
        <RouterLink to="/">{{ t('nav.home') }}</RouterLink>
        <RouterLink to="/explore">{{ t('nav.explore') }}</RouterLink>
      </nav>

      <div class="site-header__actions">
        <LanguageSwitch class="desktop-language" />
        <button
          class="menu-toggle"
          type="button"
          :aria-label="menuOpen ? t('nav.close') : t('nav.menu')"
          :aria-expanded="menuOpen"
          aria-controls="mobile-navigation"
          @click="menuOpen = !menuOpen"
        >
          <span></span><span></span>
        </button>
      </div>
    </div>

    <Transition name="menu">
      <nav v-if="menuOpen" id="mobile-navigation" class="mobile-nav" aria-label="移动端导航">
        <RouterLink to="/">{{ t('nav.home') }}</RouterLink>
        <RouterLink to="/explore">{{ t('nav.explore') }}</RouterLink>
        <LanguageSwitch />
      </nav>
    </Transition>
  </header>
</template>

<style scoped lang="scss">
.site-header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 100;
  height: 76px;
  border-bottom: 1px solid transparent;
  transition:
    background var(--motion-base),
    border-color var(--motion-base),
    backdrop-filter var(--motion-base);
}

.site-header--scrolled {
  background: rgba(7, 7, 8, 0.78);
  border-color: var(--color-border);
  backdrop-filter: blur(var(--blur-navigation));
}

.site-header__inner {
  height: 100%;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}
.site-header__actions {
  justify-self: end;
  display: flex;
  align-items: center;
}
.wordmark {
  color: var(--color-text);
  font-size: 20px;
  letter-spacing: -0.04em;
}
.wordmark strong {
  font-weight: 700;
}
.wordmark span {
  font-weight: 300;
}
.desktop-nav {
  display: flex;
  gap: 38px;
  align-items: center;
}
.desktop-nav a {
  position: relative;
  padding: 26px 2px;
  color: var(--color-text-muted);
  font-size: 13px;
  letter-spacing: 0.08em;
  transition: color var(--motion-fast);
}
.desktop-nav a::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 18px;
  width: 0;
  height: 1px;
  background: var(--color-text);
  transform: translateX(-50%);
  transition: width var(--motion-fast);
}
.desktop-nav a:hover,
.desktop-nav a.router-link-active {
  color: var(--color-text);
}
.desktop-nav a.router-link-active::after {
  width: 18px;
}
.menu-toggle {
  display: none;
  width: 44px;
  height: 44px;
  place-content: center;
  gap: 7px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-glass);
  cursor: pointer;
}
.menu-toggle span {
  display: block;
  width: 16px;
  height: 1px;
  background: var(--color-text);
  transition: transform var(--motion-fast);
}
.mobile-nav {
  position: absolute;
  inset: 76px 16px auto;
  display: grid;
  gap: 4px;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgba(13, 14, 16, 0.96);
  box-shadow: var(--shadow-panel);
}
.mobile-nav > a {
  min-height: 52px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: 16px;
}
.mobile-nav > a.router-link-active {
  background: var(--color-glass-strong);
  color: var(--color-text);
}
.mobile-nav .language-switch {
  justify-self: start;
  margin: 12px 16px 6px;
}
.menu-enter-active,
.menu-leave-active {
  transition:
    opacity var(--motion-fast),
    transform var(--motion-fast);
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 767px) {
  .site-header {
    height: 68px;
  }
  .site-header__inner {
    grid-template-columns: 1fr auto;
  }
  .desktop-nav,
  .desktop-language {
    display: none;
  }
  .menu-toggle {
    display: grid;
  }
  .mobile-nav {
    inset-block-start: 68px;
  }
  .site-header--scrolled {
    backdrop-filter: blur(12px);
  }
}
</style>
