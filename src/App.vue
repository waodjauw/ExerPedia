<script setup lang="ts">
import SiteFooter from '@/components/global/SiteFooter.vue'
import SiteHeader from '@/components/global/SiteHeader.vue'
</script>

<template>
  <a class="skip-link" href="#main-content">跳到主要内容</a>
  <SiteHeader />
  <main id="main-content">
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
  <SiteFooter />
</template>
