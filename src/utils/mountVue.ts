import globalComponents from '@/components/index'
import { createApp, type Component } from 'vue'
import { useWebStore } from '@/stores/web'
import { createPinia } from 'pinia'
import '@/assets/css/main.sass'
import router from '@/router'

const pinia = createPinia()

export default function ({ component, el }: { component: Component; el?: Element | string }) {
  const app = createApp(component).use(pinia).use(router).use(globalComponents)
  useWebStore()

  if (!import.meta.env.SSR) {
    router.isReady().then(() => {
      if (!el) {
        el = document.createElement('div')
      }
      app.mount(el)
    })
  }
  return app
}

export type ComponentProps<C extends Component> = C extends (abstract new (
  ...args: unknown[]
) => infer I extends { $props: unknown })
  ? I['$props']
  : C extends { props: unknown }
    ? C['props']
    : unknown
