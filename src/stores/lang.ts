import _ from 'lodash'
import { defineStore } from 'pinia'
import { useWebStore } from './web'
import { computed, reactive } from 'vue'

export const useLangStore = defineStore('lang', () => {
  const webStore: { lang: string; cdn: string } = useWebStore()

  const texts = computed(() => {
    // default all unset route {}
    const currentLangTexts = _.mapValues(collection, route => {
      return _.mapValues(route, key => key[webStore.lang] || key['zh_Hans'])
    })
    return new Proxy(currentLangTexts, {
      get(target: typeof currentLangTexts, prop: string): (typeof currentLangTexts)[string] {
        const routeTexts = target[prop] || {}
        return new Proxy(routeTexts, {
          get(_routeTexts, key: string): string {
            // window._lang ??= JSON.parse(localStorage.getItem('_lang') || '{}')
            // _lang[prop] ??= {}
            // _lang[prop][key] ??= {}
            // _lang[prop][key].zh_Hans = collection[prop][key]?.zh_Hans || key
            // _lang[prop][key].ja = collection[prop][key]?.ja || key
            // localStorage.setItem('_lang', JSON.stringify(window._lang))
            if (!import.meta.env.SSR && key !== '__v_isRef' && _routeTexts[key] === undefined) {
              const _k = `${prop}.${key}`
              if (!unsetKeys.has(_k)) {
                unsetKeys.add(_k)
                fetch(`/log?key=collection.${_k}`)
              }
            }
            return _routeTexts[key] || key
          },
        })
      },
    })
  })

  function addRouteLang(routeName: string, langs: RouteLanguage) {
    collection[routeName] = langs
    return texts.value[routeName]
  }

  return { collection, texts, addRouteLang }
})

const unsetKeys = new Set()

const collection: Record<string, RouteLanguage> = reactive({
  Home: {
    routeName: {
      zh_Hans: '首頁',
      ja: 'home',
    },
  },
  Web: {
    lang: {
      zh_Hans: '中文',
      en_US: 'english',
      pt_PT: 'Língua portuguesa',
    },
    routeName: {
      zh_Hans: 'BitGaming',
      en: 'BitGaming',
    },
    noData: {
      zh_Hans: '无数据',
    },
    required: {
      zh_Hans: '必填',
      ja: 'required',
    },
    equalPwd: {
      zh_Hans: '两次输入的密码必须相同',
    },
    verify6Err: {
      zh_Hans: '请输入6位验证码',
    },
    equalAccountErr: {
      zh_Hans: '密码不可以跟账号相同',
    },
    azDig6to12: {
      zh_Hans: '6-12位英数组合',
    },
    upperInside: {
      zh_Hans: '至少1位英文大写',
    },
    vaildateErr: {
      zh_Hans: '格式错误',
    },
    phoneErr: {
      zh_Hans: '请输入正确手机号码',
    },
    mailErr: {
      zh_Hans: '请输入正确EMAIL',
    },
    pwdEmptyErr: {
      zh_Hans: '请输入密码',
    },
    accountEmptyErr: {
      zh_Hans: '请输入账号',
    },
    lineErr: {
      zh_Hans: '请输入Line ID',
    },
    Su: { zh_Hans: '日', ja: '日' },
    Mo: { zh_Hans: '一', ja: '月' },
    Tu: { zh_Hans: '二', ja: '火' },
    We: { zh_Hans: '三', ja: '水' },
    Th: { zh_Hans: '四', ja: '木' },
    Fr: { zh_Hans: '五', ja: '金' },
    Sa: { zh_Hans: '六', ja: '土' },
    周日: { zh_Hans: '周日', ja: '日曜日' },
    周一: {
      zh_Hans: '周一',
      ja: '月曜日',
    },
    周二: {
      zh_Hans: '周二',
      ja: '火曜日',
    },
    周三: {
      zh_Hans: '周三',
      ja: '水曜日',
    },
    周四: {
      zh_Hans: '周四',
      ja: '木曜日',
    },
    周五: {
      zh_Hans: '周五',
      ja: '金曜日',
    },
    周六: {
      zh_Hans: '周六',
      ja: '土曜日',
    },
    确认: { zh_Hans: '确认' },
    取消: { zh_Hans: '取消' },
    清除: { zh_Hans: '清除' },
    提示: { zh_Hans: '提示' },
    选择: { zh_Hans: '选择' },
    年: { zh_Hans: '年' },
    月: { zh_Hans: '月' },
    日: { zh_Hans: '日' },
    登出: {
      zh_Hans: '登出',
    },
    失败: {
      zh_Hans: '失败',
    },
    成功: {
      zh_Hans: '成功',
    },
    已登出: {
      zh_Hans: '账号已登出',
    },
    checkAction: {
      zh_Hans: '确定要',
    },
    pageUnit: {
      zh_Hans: '页',
    },
    itemUnit: {
      zh_Hans: '笔',
    },
    all: {
      zh_Hans: '全部',
    },
    EGame_ArcadeGame: {
      zh_Hans: '街机游戏',
      en_US: 'ArcadeGame',
    },
    EGame_SlotGame: {
      zh_Hans: '老虎机',
      en_US: 'SlotGame',
    },
    EGame_InteractiveGames: {
      zh_Hans: '互动游戏',
      en_US: 'InteractiveGames',
    },
    EGame_TableGames: {
      zh_Hans: '桌上游戏',
      en_US: 'TableGames',
    },
    EGame_FishGame: {
      zh_Hans: '捕鱼游戏',
      en_US: 'FishGame',
    },
    Live_Baccarat: {
      zh_Hans: '百家乐',
      en_US: 'Baccarat',
    },
    Live_Roulette: {
      zh_Hans: '轮盘',
      en_US: 'Roulette',
    },
    Live_Blackjack: {
      zh_Hans: '二十一点',
      en_US: 'Blackjack',
    },
    Live_FriedGoldenFlower: {
      zh_Hans: '炸金花',
      en_US: 'FriedGoldenFlower',
    },
    Live_Sangong: {
      zh_Hans: '三公',
      en_US: 'Sangong',
    },
    Live_NiuNiu: {
      zh_Hans: '牛牛',
      en_US: 'NiuNiu',
    },
    Live_DragonTiger: {
      zh_Hans: '龙虎',
      en_US: 'DragonTiger',
    },
    Live_SicBo: {
      zh_Hans: '骰宝',
      en_US: 'SicBo',
    },
    EGame_Bingo: {
      zh_Hans: '宾果',
      en_US: 'Bingo',
    },
    Lottery: {
      zh_Hans: '彩票',
      en_US: 'Lottery',
    },
    Sports: {
      zh_Hans: '体育',
      en_US: 'Sport',
    },
    ESports: {
      zh_Hans: '电竞',
      en_US: 'ArcadeGame',
    },
    Live: {
      zh_Hans: '真人娱乐',
      en_US: 'Live Casino',
    },
    Slot: {
      zh_Hans: '电子',
      en_US: 'EGame',
    },
    Chess: {
      zh_Hans: '棋牌',
      en_US: 'Chess',
    },
  },
})
interface langTexts extends Record<string, string> {
  zh_Hans: string
}
type RouteLanguage = Record<string, langTexts> & { routeName: langTexts }
