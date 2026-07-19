<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { fieldLabel } from '@/data/field-labels'

const emit = defineEmits<{ select: [bodyPart: string] }>()
const app = useAppStore()
const active = ref<string | null>(null)
const BodyModel3D = defineAsyncComponent(() => import('./BodyModel3D.vue'))

const parts = ['shoulders', 'chest', 'upper arms', 'waist', 'back', 'upper legs']

function selectPart(key: string) {
  emit('select', key)
}
</script>

<template>
  <div class="body-explorer">
    <div class="body-map" aria-label="三维人体部位交互图">
      <div class="body-map__halo" aria-hidden="true"></div>
      <div class="body-map__orbit body-map__orbit--outer" aria-hidden="true"></div>
      <div class="body-map__orbit body-map__orbit--inner" aria-hidden="true"></div>
      <div class="body-map__axis" aria-hidden="true"><span></span></div>
      <span class="body-map__caption body-map__caption--top" aria-hidden="true"
        >3D MESH / INTERACTIVE</span
      >
      <span class="body-map__caption body-map__caption--bottom" aria-hidden="true"
        >DRAG / ROTATE / SELECT</span
      >
      <Suspense>
        <BodyModel3D :active="active" @hover="active = $event" @select="selectPart" />
        <template #fallback>
          <div class="body-map__boot" aria-live="polite">INITIALIZING 3D BODY</div>
        </template>
      </Suspense>
    </div>

    <div class="body-part-list" aria-label="按身体部位选择">
      <button
        v-for="(part, index) in parts"
        :key="part"
        type="button"
        :class="{ active: active === part }"
        @mouseenter="active = part"
        @mouseleave="active = null"
        @focus="active = part"
        @blur="active = null"
        @click="selectPart(part)"
      >
        <span>0{{ index + 1 }}</span>
        {{ fieldLabel(part, app.locale) }}
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.body-explorer {
  display: grid;
  grid-template-columns: minmax(440px, 1.15fr) minmax(280px, 0.85fr);
  gap: clamp(44px, 8vw, 112px);
  align-items: center;
}

.body-map {
  position: relative;
  min-height: 700px;
  display: grid;
  place-items: center;
  isolation: isolate;
}

.body-map::before {
  content: '';
  position: absolute;
  z-index: -3;
  width: 92%;
  aspect-ratio: 1;
  border: 1px solid rgba(255, 255, 255, 0.035);
  border-radius: 50%;
  background:
    linear-gradient(90deg, transparent 49.8%, rgba(255, 255, 255, 0.055) 50%, transparent 50.2%),
    linear-gradient(transparent 49.8%, rgba(255, 255, 255, 0.04) 50%, transparent 50.2%);
}

.body-map__halo {
  position: absolute;
  z-index: -3;
  width: 58%;
  aspect-ratio: 0.72;
  border-radius: 50%;
  background: rgba(156, 190, 210, 0.11);
  filter: blur(64px);
}

.body-map__orbit {
  position: absolute;
  z-index: -2;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  transform: rotate(-8deg);
}

.body-map__orbit--outer {
  width: 590px;
  height: 590px;
}
.body-map__orbit--inner {
  width: 430px;
  height: 610px;
  border-color: rgba(255, 255, 255, 0.07);
  transform: rotate(8deg);
}

.body-map__axis {
  position: absolute;
  z-index: -1;
  width: 1px;
  height: 88%;
  background: linear-gradient(
    transparent,
    rgba(255, 255, 255, 0.12) 18%,
    rgba(255, 255, 255, 0.12) 82%,
    transparent
  );
}

.body-map__axis span,
.body-map__axis::before,
.body-map__axis::after {
  content: '';
  position: absolute;
  left: -4px;
  width: 9px;
  height: 1px;
  background: rgba(255, 255, 255, 0.25);
}
.body-map__axis::before {
  top: 18%;
}
.body-map__axis span {
  top: 50%;
}
.body-map__axis::after {
  bottom: 18%;
}

.body-map__caption {
  position: absolute;
  z-index: 3;
  color: var(--color-text-faint);
  font-size: 8px;
  letter-spacing: 0.18em;
}
.body-map__caption--top {
  top: 28px;
  left: 4px;
}
.body-map__caption--bottom {
  right: 2px;
  bottom: 28px;
}

.body-map__boot {
  color: var(--color-text-faint);
  font-size: 9px;
  letter-spacing: 0.16em;
}

.body-part-list {
  display: grid;
  border-top: 1px solid var(--color-border);
}
.body-part-list button {
  min-height: 68px;
  display: grid;
  grid-template-columns: 38px 1fr 24px;
  align-items: center;
  gap: 12px;
  padding: 0 6px;
  border: 0;
  border-bottom: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  text-align: left;
  font-size: 20px;
  cursor: pointer;
  transition:
    color var(--motion-fast),
    padding var(--motion-fast),
    background var(--motion-fast);
}
.body-part-list button > span {
  color: var(--color-text-faint);
  font-size: 10px;
  letter-spacing: 0.12em;
}
.body-part-list svg {
  width: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.4;
}
.body-part-list button:hover,
.body-part-list button:focus-visible,
.body-part-list button.active {
  padding-left: 13px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.035), transparent);
  color: var(--color-text);
}

@media (max-width: 900px) {
  .body-explorer {
    grid-template-columns: 1fr;
  }
  .body-map {
    min-height: 650px;
  }
}

@media (max-width: 520px) {
  .body-map {
    min-height: 560px;
  }
  .body-map__orbit--outer {
    width: 440px;
    height: 440px;
  }
  .body-map__orbit--inner {
    width: 320px;
    height: 470px;
  }
  .body-map__caption--top {
    top: 16px;
    left: 0;
  }
  .body-map__caption--bottom {
    right: 0;
    bottom: 16px;
  }
  .body-part-list button {
    min-height: 62px;
    font-size: 18px;
  }
}
</style>
