import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    { path: '/explore', name: 'explore', component: () => import('@/views/ExploreView.vue') },
    {
      path: '/exercise/:id',
      name: 'exercise-detail',
      component: () => import('@/views/ExerciseDetailView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.name === 'explore' && from.name === 'exercise-detail') return false
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const suffix = to.name === 'home' ? '探索每一个动作' : '健身动作百科'
  document.title = `ExerPedia — ${suffix}`
})

export default router
