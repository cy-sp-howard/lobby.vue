import { useLangStore } from '@/stores/lang'
useLangStore().addRouteLang('Playing', {
  routeName: {
    zh_Hans: '读取中',
    en_US: 'Loading',
  },
})
