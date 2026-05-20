import VueRouter from 'vue-router'

const router = new VueRouter({
  routes: [
    {
      path: '/',
      redirect: '/pinia'
    },
    {
      path: '/pinia',
      component: () => import('../views/Pinia.vue')
    },
    {
      path: '/vue_router',
      component: () => import('../views/VueRouter.vue')
    },
    {
      path: '/search',
      component: () => import('../views/Search.vue')
    },
    {
      path: '/frame_cache_test',
      component: () => import('../views/FrameCacheTest.vue')
    }
  ],
  mode: 'hash'
})

export default router
