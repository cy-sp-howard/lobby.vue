import _ from 'lodash'
import { defineStore } from 'pinia'
import { Validate, RefreshToken } from '@/api/User'
import { useWebStore } from './web'
import type { RespData } from '@/utils/request'
import { reactive, toRefs, computed } from 'vue'
import img1 from '@img/aaa.png'
import cookieRef from '@/utils/cookieRef'
// import avatardefaultImg from '@img/account/member_avatar_default.png'

const queryToken = import.meta.env.SSR ? null : new URLSearchParams(location.search).get('token')

export const useUserStore = defineStore('user', () => {
  const webStore = useWebStore()
  const _user = reactive<RespData<typeof Validate>['RespData']>(defaultUserData())
  const lastUpdate = reactive({
    t: 0,
    promise: Promise.resolve(),
  })
  const token = cookieRef([queryToken, ''], {
    key: 'auth',
    sameSite: 'strict',
    expires: (1 / 24 / 60) * 15,
  })

  const isAuth = computed(() => Boolean(token.value[1]))

  function reset() {
    lastUpdate.t = 0
    token.value = [queryToken, '']
    _.assign(_user, defaultUserData())
  }
  function keepOnline() {
    if (!isAuth.value) return
    RefreshToken().then(({ Data }) => {
      _user.Balance = Data.UserData.Balance
      token.value = [queryToken, Data.UserToken]
    })
  }
  function update() {
    if (queryToken && token.value[0] !== queryToken) {
      reset()
    } else if (!isAuth.value && !queryToken) return Promise.reject('token need')
    const now = Date.now()
    if (now - lastUpdate.t <= 1000) return Promise.resolve(lastUpdate.promise)
    lastUpdate.t = Date.now()
    return (lastUpdate.promise = Validate({ AuthToken: isAuth.value ? null : queryToken })
      .then(({ Data }) => {
        if (Data.UserToken) {
          token.value = [queryToken, Data.UserToken]
        }
        _.assign(_user, Data.RespData)
        webStore.lang = _user.Language || webStore.lang
        if (!Data.RespData.Avatar) {
          _user.Avatar = img1
          return
        }
        const host = webStore.cdn
        const avatarSrc = `${host}/${Data.RespData.Avatar}`
        testImage(avatarSrc)
          .then(() => {
            _user.Avatar = avatarSrc
          })
          .catch(() => {
            _user.Avatar = img1
          })
      })
      .catch(() => {
        _.assign(_user, defaultUserData())
      }))
  }
  return {
    ...toRefs(_user),
    token,
    lastUpdate,
    isAuth,
    reset,
    update,
    keepOnline,
  }
})

function defaultUserData(): RespData<typeof Validate>['RespData'] {
  return {
    Avatar: img1,
    Balance: 0,
    Banner: [],
    Currency: '',
    GameFavorite: [],
    GameGuessLike: [],
    GameKindList: [],
    GameHot: [],
    GameNew: [],
    GameRecent: [],
    Language: 'en_US',
    Notify: false,
  }
}

const errImgs: string[] = []
function testImage(src: string) {
  if (errImgs.includes(src)) return Promise.reject()
  return new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.onerror = () => {
      errImgs.push(src)
      reject()
    }
    img.onload = () => resolve()
    img.src = src
  })
}
