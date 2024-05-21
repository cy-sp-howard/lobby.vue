import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'
import permission from './permission'
import Layout from '@/components/layout/index.vue'

const createHistory = import.meta.env.SSR ? createMemoryHistory : createWebHistory
const router = createRouter({
  history: createHistory(import.meta.env.BASE_URL),
  sensitive: true,
  routes: [
    {
      name: 'Root',
      path: '/',
      redirect: '/home',
      component: Layout,
      children: [
        {
          name: 'Home',
          path: '/home',
          component: () => import('@/views/Home/index.vue'),
        },
        {
          name: 'Favorite',
          path: '/favorite',
          component: () => import('@/views/Favorite/index.vue'),
        },
        {
          name: 'History',
          path: '/history',
          component: () => import('@/views/History/index.vue'),
        },
        {
          name: 'EGame',
          path: '/egame',
          component: () => import('@/views/EGame/index.vue'),
        },
        {
          name: 'Live',
          path: '/live',
          component: () => import('@/views/Live/index.vue'),
        },
        {
          name: 'Lottery',
          path: '/lottery',
          component: () => import('@/views/Lottery/index.vue'),
        },
        {
          name: 'Hot',
          path: '/hot',
          component: () => import('@/views/Hot/index.vue'),
        },
        {
          name: 'Recommend',
          path: '/recommend',
          component: () => import('@/views/Recommend/index.vue'),
        },
        {
          name: 'New',
          path: '/new',
          component: () => import('@/views/New/index.vue'),
        },
        {
          name: 'Account',
          path: '/account',
          component: () => import('@/views/Account/index.vue'),
        },
      ],
    },
    {
      name: 'Playing',
      path: '/playing',
      component: () => import('@/views/Playing/index.vue'),
    },
    {
      name: 'Forbidden',
      path: '/403',
      component: () => import('@/views/Forbidden/index.vue'),
    },
    {
      name: 'Unavailable',
      path: '/503',
      component: () => import('@/views/Unavailable/index.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      redirect: '/',
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(permission)
export default router
