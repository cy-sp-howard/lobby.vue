import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useWebStore } from '@/stores/web'

export default function (
  getTarget: () => HTMLElement | unknown,
  handler: (i: DOMRect) => void,
  isEnable: () => boolean = () => true,
  onDisappear?: () => unknown,
) {
  if (import.meta.env.SSR) return { triggerAnchor: () => {} }
  const webStore = useWebStore()
  const obs = new IntersectionObserver(
    ent => {
      ent.forEach(i => {
        !i.isIntersecting && onDisappear && onDisappear()
      })
    },
    {
      root: null,
      rootMargin: '0px',
      threshold: [0],
    },
  )
  const abortCtrl = new AbortController()
  addEventListener('scroll', callHandler, { capture: true, signal: abortCtrl.signal })

  watch(() => webStore.size, callHandler, { deep: true })

  function callHandler() {
    if (!isEnable()) return
    const el = getTarget()
    if (el instanceof HTMLElement) {
      handler(el.getBoundingClientRect())
    }
  }

  onMounted(() => {
    const el = getTarget()
    if (el instanceof HTMLElement && onDisappear) {
      obs.observe(el)
    }
  })
  onBeforeUnmount(() => {
    abortCtrl.abort()
    obs.disconnect()
  })
  return {
    triggerAnchor: callHandler,
  }
}
