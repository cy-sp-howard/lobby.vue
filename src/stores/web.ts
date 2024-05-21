import { reactive, watch, ref, customRef } from 'vue'
import useStorage from '@/utils/useStorage'
import { useLangStore } from './lang'
import { defineStore } from 'pinia'
import router from '@/router'
import _ from 'lodash'

const SSR = import.meta.env.SSR
const w = SSR ? { document: null } : window

export const useWebStore = defineStore('web', () => {
  const langStore = useLangStore()
  const { lang } = useStorage({
    lang: getDefaultLang(),
  })
  const size = reactive({
    vw: w.document?.documentElement.clientWidth || 0,
    vh: w.document?.documentElement.clientHeight || 0,
  })
  const scrollPos = reactive({
    x: w.document?.documentElement.scrollLeft || 0,
    y: w.document?.documentElement.scrollTop || 0,
  })
  const cdn = ref('http://cdn.icons.bitgaming.cc')
  const title = customRef((track, trigger) => {
    return {
      get() {
        track()
        if (SSR) return ''
        return document.title
      },
      set(val: string) {
        if (SSR) return
        document.title = val
        trigger()
      },
    }
  })

  watch(
    [lang, () => router.currentRoute.value.name],
    ([_lang, _name]) => {
      if (SSR) return ''
      if (_name) {
        setTitle(langStore.texts[String(_name)].routeName)
      }
      document.documentElement.lang = _lang.replace(/_.*/, '')
    },
    { immediate: true },
  )

  function getDefaultLang() {
    if (SSR) return 'zh_Hans'
    const langs = _.keys(langStore.collection.Web.lang)
    const preferLangs = _.map(navigator.languages, i => i.split('-')[0])
    return _.find(preferLangs, i => langs.includes(i)) || 'zh_Hans'
  }
  function setTitle(text: string) {
    title.value = langStore.texts.Web.routeName
    if (!text) return
    title.value = `${text} - ${title.value}`
  }

  return {
    cdn,
    lang,
    size,
    scrollPos,
    isLimit: ref(false),
    isMaintenance: ref(false),
    setTitle,
  }
})
