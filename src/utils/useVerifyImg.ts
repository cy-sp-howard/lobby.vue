import { computed } from 'vue'
import _ from 'lodash'

export default function <T extends Record<string, unknown>>(
  postData: T,
  keyOpt?: { code?: keyof T; key?: keyof T },
) {
  const { code, key } = _.assign({ code: 'VerifyCode', key: 'VerifyKey' }, keyOpt)

  const verifyImgStyle = computed(() => {
    return { backgroundImage: `url('${verifyImgUrl.value}')` }
  })
  const verifyImgUrl = computed(() => {
    const base = new URL('/api/VerifyCode/Get', import.meta.env.SSR ? '' : location.origin)
    base.searchParams.set('key', String(postData[key]))
    return base.toString()
  })

  function resetVerify() {
    _.assign(postData, { [key]: getVerifyCode(), [code]: '' })
  }

  function getVerifyCode() {
    const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    return _.chain(10)
      .random(15)
      .times(() => _.sample(str))
      .join('')
      .value()
  }
  resetVerify()
  return { verifyImgStyle, verifyImgUrl, getVerifyCode, resetVerify }
}
