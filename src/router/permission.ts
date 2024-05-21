import type { NavigationGuardWithThis } from 'vue-router'
import { useWebStore } from '@/stores/web'
import { useUserStore } from '@/stores/user'

const permission: NavigationGuardWithThis<undefined> = async function (
  to,
  from,
  // next: Parameters<NavigationGuard>[2],
) {
  const webStore = useWebStore()
  const userStore = useUserStore()
  if (!import.meta.env.SSR) {
    // before route
  }

  if (webStore.isLimit && to.name !== 'Forbidden') return { name: 'Forbidden' }
  if (!webStore.isLimit && to.name === 'Forbidden') return '/'

  if (webStore.isMaintenance && to.name !== 'Unavailable') return { name: 'Unavailable' }
  if (!webStore.isMaintenance && to.name === 'Unavailable') return '/'

  if (to.meta.auth && !userStore.isAuth) return from.matched.length ? login() : '/'
}

export default permission

export function login() {
  return Promise.resolve()
}
