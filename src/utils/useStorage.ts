import _ from 'lodash'
import crypto from 'crypto-js'
import { reactive, toRefs, watch } from 'vue'
const key = 'storage'
const secret = 'why you come here?'

export default function <T extends Record<string, unknown>>(defaultData?: T) {
  const storage = reactive((defaultData || {}) as T)

  try {
    const bytes = crypto.AES.decrypt(String(localStorage.getItem(key)), secret)

    _.assign(storage, JSON.parse(bytes.toString(crypto.enc.Utf8)))
  } catch (e) {
    /* empty */
  }

  watch(
    storage,
    ni => {
      if (import.meta.env.SSR) return
      localStorage.setItem(key, crypto.AES.encrypt(JSON.stringify(ni), secret).toString())
    },
    { immediate: true },
  )

  return { ...toRefs(storage), storage }
}
