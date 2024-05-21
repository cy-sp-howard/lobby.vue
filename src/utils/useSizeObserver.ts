import { onBeforeUnmount, onMounted } from 'vue'
import _ from 'lodash'

export default function (
  getTarget: () => HTMLElement | unknown,
  handler: () => void,
  opts?: { interval?: number; subtree?: boolean; childList?: boolean; attributes?: boolean },
) {
  if (import.meta.env.SSR) return
  const { interval, subtree, childList, attributes } = _.assign(
    { interval: 200, subtree: true, childList: true, attributes: false },
    opts,
  )
  const obsSelf = new ResizeObserver(handler)
  const obsInside = new MutationObserver(_.throttle(handler, interval))

  onMounted(() => {
    const target = getTarget()
    if (target instanceof HTMLElement) {
      obsSelf.observe(target)
      obsInside.observe(target, { subtree, childList, attributes })
    }
  })
  onBeforeUnmount(() => {
    obsSelf.disconnect()
    obsInside.disconnect()
  })
}
