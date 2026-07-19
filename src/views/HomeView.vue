<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BodyMap from '@/components/home/BodyMap.vue'
import { useExploreStore } from '@/stores/explore'
import { useReducedMotion } from '@/composables/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)
const { t, tm } = useI18n()
const router = useRouter()
const explore = useExploreStore()
const reducedMotion = useReducedMotion()
const root = ref<HTMLElement | null>(null)
let context: gsap.Context | undefined

function exploreBodyPart(part: string) {
  explore.setBodyPart(part)
  router.push('/explore')
}

onMounted(async () => {
  await nextTick()
  if (!root.value || reducedMotion.value) return
  context = gsap.context(() => {
    gsap
      .timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero__eyebrow', { opacity: 0, y: 12, duration: 0.5 })
      .from(
        '.hero__title-line',
        { opacity: 0, yPercent: 105, duration: 0.75, stagger: 0.1 },
        '-=.2',
      )
      .from(
        '.hero__intro, .hero__actions',
        { opacity: 0, y: 18, duration: 0.55, stagger: 0.08 },
        '-=.35',
      )
      .from('.hero-visual', { opacity: 0, scale: 1.04, duration: 0.9 }, '-=.65')

    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
      gsap.from(element, {
        opacity: 0,
        y: 32,
        duration: 0.65,
        ease: 'power2.out',
        scrollTrigger: { trigger: element, start: 'top 86%', once: true },
      })
    })
    gsap.to('.hero-visual__orbit--one', {
      rotate: 45,
      yPercent: 12,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
    })
  }, root.value)
})

onBeforeUnmount(() => context?.revert())
</script>

<template>
  <div ref="root" class="home-view">
    <section class="hero">
      <div class="hero__grid container">
        <div class="hero__content">
          <p class="hero__eyebrow eyebrow">{{ t('home.eyebrow') }}</p>
          <h1 class="hero__title" aria-label="Explore Every Move.">
            <span
              ><span class="hero__title-line">{{ t('home.titleA') }}</span></span
            >
            <span
              ><span class="hero__title-line hero__title-line--silver">{{
                t('home.titleB')
              }}</span></span
            >
          </h1>
          <p class="hero__intro">{{ t('home.intro') }}</p>
          <div class="hero__actions">
            <RouterLink class="button" to="/explore"
              >{{ t('common.start') }} <span aria-hidden="true">↗</span></RouterLink
            >
          </div>
        </div>

        <div class="hero-visual" aria-hidden="true">
          <div class="hero-visual__orbit hero-visual__orbit--one"></div>
          <div class="hero-visual__orbit hero-visual__orbit--two"></div>
          <div class="hero-visual__core">
            <div class="hero-visual__monogram">XP</div>
            <div class="hero-visual__axis"></div>
          </div>
          <span class="hero-visual__meta hero-visual__meta--top">BODY / MOTION / INDEX</span>
          <span class="hero-visual__meta hero-visual__meta--bottom">48 ESSENTIAL MOVEMENTS</span>
        </div>
      </div>
      <div class="hero__scroll container"><span></span>{{ t('home.scroll') }}</div>
    </section>

    <section class="body-section">
      <div class="container">
        <div class="section-heading" data-reveal>
          <p class="eyebrow">{{ t('home.bodyEyebrow') }}</p>
          <h2 class="section-title">{{ t('home.bodyTitle') }}</h2>
          <p class="section-copy">{{ t('home.bodyIntro') }}</p>
        </div>
        <div data-reveal><BodyMap @select="exploreBodyPart" /></div>
      </div>
    </section>

    <section class="principles-section">
      <div class="container">
        <div class="section-heading" data-reveal>
          <p class="eyebrow">{{ t('home.principlesEyebrow') }}</p>
          <h2 class="section-title">{{ t('home.principlesTitle') }}</h2>
        </div>
        <div class="principles-grid">
          <article v-for="item in tm('home.principles')" :key="item.number" data-reveal>
            <span>{{ item.number }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="closing-section">
      <div class="closing-section__glow" aria-hidden="true"></div>
      <div class="container closing-section__inner" data-reveal>
        <p class="eyebrow">Explore Every Move.</p>
        <h2>{{ t('home.closing') }}</h2>
        <RouterLink class="button" to="/explore"
          >{{ t('common.exploreExercises') }} <span aria-hidden="true">→</span></RouterLink
        >
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.hero {
  position: relative;
  min-height: 100svh;
  display: grid;
  align-items: center;
  overflow: hidden;
  border-bottom: 1px solid var(--color-border);
}
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 80px 80px;
  mask-image: radial-gradient(circle at 68% 45%, black 0, transparent 63%);
}
.hero__grid {
  position: relative;
  z-index: 1;
  min-height: 800px;
  display: grid;
  grid-template-columns: 1.08fr 0.92fr;
  align-items: center;
  gap: 50px;
  padding-top: 100px;
}
.hero__content {
  position: relative;
  z-index: 2;
}
.hero__eyebrow {
  margin-bottom: 28px;
}
.hero__title {
  margin: 0;
  font-size: clamp(68px, 8.1vw, 116px);
  font-weight: 520;
  line-height: 0.95;
  letter-spacing: -0.075em;
}
.hero__title > span {
  display: block;
  overflow: hidden;
  padding-right: 0.09em;
}
.hero__title-line {
  display: block;
}
.hero__title-line--silver {
  color: transparent;
  background: linear-gradient(105deg, #f8f8f5 5%, #8e9298 46%, #eceeed 84%);
  background-clip: text;
  -webkit-background-clip: text;
}
.hero__intro {
  max-width: 530px;
  margin: 34px 0 0;
  color: var(--color-text-muted);
  font-size: clamp(16px, 1.5vw, 19px);
  line-height: 1.8;
}
.hero__actions {
  margin-top: 36px;
}
.hero-visual {
  position: relative;
  width: min(560px, 47vw);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  justify-self: center;
}
.hero-visual::before {
  content: '';
  position: absolute;
  width: 58%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: rgba(224, 227, 230, 0.1);
  filter: blur(60px);
}
.hero-visual__orbit {
  position: absolute;
  border: 1px solid var(--color-border);
  border-radius: 50%;
}
.hero-visual__orbit::before {
  content: '';
  position: absolute;
  left: 50%;
  top: -4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-text);
  box-shadow: 0 0 22px white;
}
.hero-visual__orbit--one {
  width: 91%;
  height: 91%;
  transform: rotate(-18deg);
}
.hero-visual__orbit--two {
  width: 68%;
  height: 68%;
  border-color: rgba(255, 255, 255, 0.09);
  transform: rotate(24deg);
}
.hero-visual__core {
  position: relative;
  width: 45%;
  aspect-ratio: 0.72;
  display: grid;
  place-items: center;
  border: 1px solid var(--color-border-strong);
  border-radius: 50% 50% 42% 42%;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.015));
  box-shadow:
    inset 20px 0 40px rgba(255, 255, 255, 0.04),
    0 40px 90px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}
.hero-visual__core::before,
.hero-visual__core::after {
  content: '';
  position: absolute;
  width: 160%;
  height: 1px;
  background: var(--color-border);
  transform: rotate(65deg);
}
.hero-visual__core::after {
  transform: rotate(-65deg);
}
.hero-visual__monogram {
  color: rgba(255, 255, 255, 0.85);
  font-size: clamp(44px, 5vw, 70px);
  font-weight: 200;
  letter-spacing: -0.08em;
}
.hero-visual__axis {
  position: absolute;
  inset: 7%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: inherit;
}
.hero-visual__meta {
  position: absolute;
  color: var(--color-text-faint);
  font-size: 9px;
  letter-spacing: 0.2em;
}
.hero-visual__meta--top {
  top: 7%;
  right: 0;
}
.hero-visual__meta--bottom {
  bottom: 8%;
  left: -2%;
}
.hero__scroll {
  position: absolute;
  z-index: 2;
  bottom: 30px;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--color-text-faint);
  font-size: 9px;
  letter-spacing: 0.16em;
  transform: translateX(-50%);
  text-transform: uppercase;
}
.hero__scroll span {
  width: 42px;
  height: 1px;
  background: var(--color-border-strong);
}
.body-section,
.principles-section {
  padding: clamp(100px, 12vw, 170px) 0;
}
.section-heading {
  max-width: 800px;
  margin-bottom: 80px;
}
.body-section {
  background: linear-gradient(180deg, var(--color-bg), var(--color-bg-secondary));
}
.principles-section {
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
}
.principles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--color-border);
  border: 1px solid var(--color-border);
}
.principles-grid article {
  min-height: 340px;
  padding: clamp(28px, 4vw, 48px);
  display: flex;
  flex-direction: column;
  background: var(--color-bg-secondary);
}
.principles-grid article > span {
  color: var(--color-text-faint);
  font-size: 10px;
  letter-spacing: 0.15em;
}
.principles-grid h3 {
  margin: auto 0 18px;
  font-size: 25px;
  font-weight: 520;
  letter-spacing: -0.03em;
}
.principles-grid p {
  margin: 0;
  color: var(--color-text-muted);
  line-height: 1.7;
}
.closing-section {
  position: relative;
  min-height: 620px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-top: 1px solid var(--color-border);
  text-align: center;
}
.closing-section__glow {
  position: absolute;
  width: 540px;
  height: 240px;
  border-radius: 50%;
  background: rgba(220, 224, 228, 0.11);
  filter: blur(90px);
}
.closing-section__inner {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
}
.closing-section h2 {
  max-width: 850px;
  margin: 0 0 42px;
  font-size: clamp(42px, 6vw, 78px);
  font-weight: 500;
  line-height: 1.08;
  letter-spacing: -0.055em;
}

@media (max-width: 900px) {
  .hero__grid {
    grid-template-columns: 1fr;
    padding-top: 130px;
    padding-bottom: 90px;
  }
  .hero__content {
    padding-top: 60px;
  }
  .hero-visual {
    position: absolute;
    right: -20%;
    width: 66vw;
    opacity: 0.5;
  }
  .principles-grid {
    grid-template-columns: 1fr;
  }
  .principles-grid article {
    min-height: 240px;
  }
}
@media (max-width: 767px) {
  .hero {
    min-height: 760px;
  }
  .hero__grid {
    min-height: 760px;
    padding-top: 90px;
  }
  .hero__title {
    font-size: clamp(56px, 17vw, 74px);
  }
  .hero__intro {
    max-width: 88%;
  }
  .hero-visual {
    right: -49%;
    width: 105vw;
    opacity: 0.35;
  }
  .hero-visual__meta {
    display: none;
  }
  .hero__scroll {
    bottom: 18px;
  }
  .section-heading {
    margin-bottom: 52px;
  }
  .body-section,
  .principles-section {
    padding: 96px 0;
  }
  .closing-section {
    min-height: 520px;
  }
}
</style>
