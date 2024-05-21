import { customRef, ref } from 'vue'
import Cookies from 'js-cookie'
import _ from 'lodash'

export default function <T>(
  value: T,
  opts: Parameters<(typeof Cookies)['set']>[2] & { key: string },
) {
  if (import.meta.env.SSR) return ref(value)
  const _value = _.cloneDeep(value)
  return customRef((track, trigger) => {
    return {
      get() {
        track()
        const cookieOriginVal = Cookies.get(opts.key)
        try {
          if (cookieOriginVal === undefined) return _value
          return JSON.parse(cookieOriginVal)
        } catch (error) {
          return cookieOriginVal
        }
      },
      set(val: typeof value) {
        if (!val) Cookies.remove(opts.key)
        else Cookies.set(opts.key, JSON.stringify(val).replace(/^"|"$/g, ''), _.omit(opts, 'key'))
        trigger()
      },
    }
  })
}
