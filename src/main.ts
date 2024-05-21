import { useWebStore } from './stores/web'
import { useUserStore } from './stores/user'
import mountVue from './utils/mountVue'
import App from './App.vue'
import _ from 'lodash'

if (!import.meta.env.SSR) {
  createApp()

  const webStore = useWebStore()
  const userStore = useUserStore()
  userStore.update()
  setInterval(userStore.keepOnline, 60 * 1000)
  addEventListener('resize', () => {
    _.assign(webStore.size, {
      vw: document.documentElement.clientWidth,
      vh: document.documentElement.clientWidth,
    })
  })
  addEventListener('scroll', () => {
    _.assign(webStore.scrollPos, {
      y: document.documentElement.scrollTop,
      x: document.documentElement.scrollLeft,
    })
  })
}

export function createApp() {
  const app = mountVue({ component: App, el: '#root' })
  _.each(import.meta.glob('./views/**/lang.ts'), i => i())

  return app
}
