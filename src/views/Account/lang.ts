import { useLangStore } from '@/stores/lang'
useLangStore().addRouteLang('Account', {
  routeName: {
    zh_Hans: '會員中心',
    en_US: 'User Center',
  },
  電子: {
    zh_Hans: '電子',
    en_US: 'Slots',
  },
})
