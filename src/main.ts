import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import { useAppStore } from './stores/app'
import './assets/styles/global.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

const appStore = useAppStore(pinia)
i18n.global.locale.value = appStore.locale
document.documentElement.lang = appStore.locale
watch(
  () => appStore.locale,
  (locale) => {
    i18n.global.locale.value = locale
  },
)

app.mount('#app')
