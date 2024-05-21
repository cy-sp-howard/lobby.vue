import { useLangStore } from '@/stores/lang'
import { computed } from 'vue'

export default function (routeName: string = 'Web') {
  const langStore = useLangStore()

  const texts = computed(() => {
    return langStore.texts[routeName]
  })
  const webTexts = computed(() => {
    return langStore.texts.Web
  })
  const rootTexts = computed(() => {
    return langStore.texts
  })
  return { texts, webTexts, langStore, rootTexts }
}
