<script lang="ts" setup>
import { FastGameKindCode, GameType, Login, type Game, type SearchGame } from '@/api/Game'
import {
  GetEGamePage,
  GetLivePage,
  GetLotteryPage,
  GetNewGamePage,
  GetHotGamePage,
  GetRecommendPage,
  GetFavoritePage,
} from '@/api/Page'
import SearchLayout from '@/components/layout/searchLayout.vue'
import Tags from '@/components/layout/tags.vue'
import { useUserStore } from '@/stores/user'
import { useWebStore } from '@/stores/web'
import type { ReqData, RespData } from '@/utils/request'
import useLang from '@/utils/useLang'
import { computed, onBeforeMount, onMounted, provide, reactive, ref, watch, inject } from 'vue'
import { useRoute } from 'vue-router'
import _ from 'lodash'
import RkSelect from '@/components/rkSelect.vue'
import Games from '@/components/layout/games.vue'
import Empty from '@/components/empty.vue'

const routeLoaded = inject('routeLoaded', () => {})
const webStore = useWebStore()
const userStore = useUserStore()
const route = useRoute()
const { webTexts, texts } = useLang('Playing')
const src = ref('')
const showSearch = ref(false)
const searchScrollTop = ref(0)
const underlineY = ref(0)
const loading = ref(0)

const tagOpts = ref<{ label: string; value: number }[][]>([[], []])
const activeLinkIndex = ref(0)
const activeKind = ref(-1)
const searchDefaultGames = ref<Game[]>([])
const game = reactive({
  GameEnglishName: '',
  GameCode: '',
  GameKind: -1,
  GameType: -1,
  Platform: '',
})

const searchDefaultGamesRender = computed(() => {
  if (!~activeKind.value) return searchDefaultGames.value
  return _.filter(searchDefaultGames.value, i => i.GameKind === activeKind.value)
})
const searchGameType = computed(() => {
  return links.value[activeLinkIndex.value]['data-type'] || -1
})
const links = computed(() => {
  return _.map(
    [
      { onClick: () => getPageB(GetEGamePage), class: { egame: true }, 'data-type': GameType.Slot },
      { onClick: () => getPageB(GetLivePage), class: { live: true }, 'data-type': GameType.Live },
      {
        onClick: () => getPageB(GetLotteryPage),
        class: { lottery: true },
        'data-type': GameType.Lottery,
      },
      { onClick: () => getPageC(GetFavoritePage), class: { fav: true } },
      { onClick: () => getPageC(GetHotGamePage), class: { hot: true } },
      { onClick: () => getPageA(GetRecommendPage), class: { recs: true } },
      { onClick: () => getPageA(GetNewGamePage), class: { new: true } },
    ],
    (i, index) => {
      return _.assign(i, {
        onMouseup: (evt: MouseEvent) => {
          moveUnderline(evt.target)
          searchDefaultGames.value = []
          tagOpts.value = [[], []]
          activeKind.value = -1
          activeLinkIndex.value = index
          toggleSearch(true)
        },
      })
    },
  )
})

watch(() => route.fullPath, getURL)

function moveUnderline(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return
  underlineY.value = el.offsetTop + el.offsetHeight / 2
}
function toggleSearch(val = !showSearch.value) {
  showSearch.value = val
}
function getMoreTagsAttrs(
  formProps: Parameters<typeof getTagsAttrs>[0],
  clickHandler: (item: { value: number }) => unknown,
) {
  return {
    tag: 'li',
    class: { active: tagOpts.value[1].map(i => i.value).includes(formProps.postData.GameKind) },
    modelValue: formProps.postData.GameKind,
    'onUpdate:modelValue'(val: unknown) {
      if (typeof val !== 'number') return
      clickHandler({ value: val })
    },
    opts: tagOpts.value[1],
  }
}
function getTagsAttrs(formProps: { submit: () => void; postData: ReqData<typeof SearchGame> }) {
  return {
    modelValue: activeKind.value,
    opts: tagOpts.value[0],
    defaultValue: -1,
    autoResetScroll: true,
    'onUpdate:modelValue'(val: unknown) {
      if (typeof val !== 'number') return
      activeKind.value = val
      formProps.postData.GameKind = activeKind.value
      formProps.submit()
    },
  }
}
function setTags(ary: RespData<typeof GetNewGamePage>['GameKindList']) {
  const _ary = _.map(ary, i => ({ label: webTexts.value[i.Key], value: i.Value }))
  const sliceIndex = _ary.length > 6 ? 5 : Infinity
  tagOpts.value = [_.take(_ary, sliceIndex), _.drop(_ary, sliceIndex)]
}
function getPageA(post: typeof GetNewGamePage | typeof GetRecommendPage) {
  loading.value += 1
  post()
    .then(({ Data }) => {
      searchDefaultGames.value = Data['GameAll']
      setTags(Data.GameKindList)
    })
    .finally(() => {
      loading.value -= 1
    })
}
function getPageB(post: typeof GetEGamePage | typeof GetLivePage | typeof GetLotteryPage) {
  loading.value += 1
  post()
    .then(({ Data }) => {
      setTags(Data.GameKindList)
    })
    .finally(() => {
      loading.value -= 1
    })
}
function getPageC(post: typeof GetHotGamePage | typeof GetFavoritePage) {
  loading.value += 1
  post()
    .then(({ Data }) => {
      setTags(
        _.chain(Data)
          .omit(['GameGuessLike'])
          .keys()
          .reject(i => !Data[i as keyof typeof Data].length)
          .map(i => ({ Key: i, Value: FastGameKindCode[i as keyof typeof FastGameKindCode] }))
          .value(),
      )
      searchDefaultGames.value = _.chain(Data).omit(['GameGuessLike']).flatMap().flatten().value()
    })
    .finally(() => {
      loading.value -= 1
    })
}
function getURL() {
  webStore.setTitle(texts.value.routeName)
  _.assign(game, history.state.game)
  src.value = ''
  if (typeof game.GameCode !== 'string') return
  Login({ Language: webStore.lang, GameCode: game.GameCode })
    .then(({ Data }) => {
      src.value = Data.GameUrl
      webStore.setTitle(game.GameEnglishName)
    })
    .catch(err => {
      if (!(err instanceof Error)) return
      src.value = getMsgURL(err.message)
    })
    .finally(routeLoaded)
}
function getMsgURL(msg: string) {
  const meta = '<meta charset="UTF-8">'
  const style =
    '<style>body{font-size:20px;line-height:calc(100vh - 16px);text-align:center;}</style>'
  const htmlText = `${meta}${style}${msg}`

  const binString = Array.from(new TextEncoder().encode(htmlText), byte =>
    String.fromCodePoint(byte),
  ).join('')
  return 'data:text/html;base64,' + btoa(binString)
}
function scrollHandler(evt: Event) {
  if (evt.target instanceof HTMLElement) {
    searchScrollTop.value = evt.target.scrollTop
  }
}
function triggerLinkClick() {
  if (!showSearch.value) return
  links.value[activeLinkIndex.value].onClick()
}

provide('gamesRootScrollTop', searchScrollTop)
onBeforeMount(getURL)
onMounted(() => {
  moveUnderline(document.querySelector('aside > button:not(.menu)'))
})
</script>
<template lang="pug">
#playing
  aside(:class="{hidden:!showSearch}")
    button.menu(@click="toggleSearch(),triggerLinkClick()")
      svg-icon(icon="menu")
    button(v-for="(i,index) in links" :key="index" v-bind="i")
    .wrapper
      router-link.home(:to="{name: 'Home'}")
      img(:src="userStore.Avatar" @click="$router.push({name:'Account'})")
  transition(name="search")
    .search-container(v-if="showSearch" @scroll="scrollHandler")
      div
        search-layout(:key="activeLinkIndex" :class="`link-${activeLinkIndex}`")
          template(#form="searchFormProps")
            tags(v-slot="{clickHandler}" v-bind="getTagsAttrs(searchFormProps)" )
              rk-select(v-if="tagOpts[1].length" v-bind="getMoreTagsAttrs(searchFormProps,clickHandler)") {{ texts['更多'] }}
          template(v-if="!~searchGameType" #default)
            games(v-if="searchDefaultGamesRender.length || loading" :list="searchDefaultGamesRender")
            empty(v-else)
  main(:class="{'loading-logo':!src}")
    iframe(:src="src")
</template>
<style lang="sass" scoped>
$underline-w: 6px
$bg: #F6F6F6
$search-w: 350px
$aside-w: 60px
#playing
  display: grid
  grid-template: 'aside underline main' / $aside-w $underline-w 1fr
  height: 100vh
  height: 100dvh
  overflow: hidden
  min-width: 300px
  > aside
    padding-top: 30px
    grid-area: aside
    grid-column-end: underline
    background: linear-gradient(to left,transparent $underline-w,#E2E2E2 $underline-w + 1px, #F6F6F6 $underline-w,#F6F6F6 100%)
    z-index: 3
    overflow: auto
    overflow-x: hidden
    display: grid
    grid-template-rows: repeat(8,40px) 1fr
    gap: 15px
    position: relative
    &::before
      content: ''
      width: 6px
      height: 35px
      background: linear-gradient(to bottom, #4368F0, #7190FF)
      position: absolute
      left: $aside-w
      top: calc(v-bind(underlineY) * 1px)
      transition: top 0.2s
      transform: translateY(-50%)
      border-radius: 0 20px 20px 0
      animation: show-underline .2s .3s backwards
    > .menu
      cursor: pointer
      font-size: 15px
      transition: background .2s
      height: 35px
      width: 35px
      border-radius: 50%
      justify-self: center
      color: #7B7B7B
      &:hover
        background: #EDEDED
    button:not(.menu),a
      background: var(--icon) no-repeat center center
      background-size: 20px
      padding-right: $underline-w
      &.egame
        --icon: url(@img/berry.png)
      &.live
        --icon: url(@img/poke.png)
      &.lottery
        --icon: url(@img/lottery.png)
      &.fav
        --icon: url(@img/heart.png)
      &.hot
        --icon: url(@img/hot.png)
      &.recs
        --icon: url(@img/recs.png)
      &.new
        --icon: url(@img/new.png)
      &.home
        --icon: url(@img/logo_mini.png)
        background-size: 25px
    .wrapper
      display: grid
      gap: inherit
      align-content: center
      grid-auto-rows: inherit
      grid-auto-rows: 40px
      > img
        cursor: pointer
        width: 30px
        height: 30px
        border: 3px solid #406AFF
        object-fit: cover
        justify-self: center
        border-radius: 50%
  > .search-container
    grid-area: main
    grid-column-start: underline
    height: 100%
    overflow: auto
    background: $bg
    z-index: 2
    width: fit-content
    max-width: calc(100vw - $aside-w)
    > div
      width: $search-w
      container: main / inline-size
      :deep(.search-layout)
        &.link-3 .game
          transition: opacity 0.2s
          &:not(.is-fav):not(:empty)
            opacity: 0.2
        > div
          --l-p-x: 15px
          --l-p-y: 10px
        > .search-header
          position: sticky
          top: -1px
          z-index: 1
          background: $bg
          padding-bottom: 0
          padding-top: var(--l-p-x)
          input
            background: #fff
          .rk-select
            grid-auto-flow: column
            align-items: center
            gap: 7px
            &::after
              content: ''
              width: 0
              height: 0
              border-left: 6px solid transparent
              border-right: 6px solid transparent
              border-top: 6px solid currentColor
        > .search-body
          .games > .container
            gap: 10px
  > main
    grid-area: main
    grid-column-start: underline
    &.loading-logo:after
      max-height: unset
    > iframe
      width: 100%
      height: 100%
      border: 0

.search-enter-active,.search-leave-active
  transition: width 0.2s ease-in
  width: $search-w !important
  overflow-x: hidden !important
.search-enter-from,.search-leave-to
  width: 0 !important

@keyframes show-underline
  0%
    width: 0
    border-radius: 0

@media (width <= 800px)
  #playing
    > aside
      > *
        transition: all .2s
      &.hidden
        background: none
        pointer-events:  none
        overflow: hidden
        &::before
          opacity: 0
        > *:not(.menu)
          opacity: 0
        > .menu
          pointer-events: all
          background: #EDEDED66
          position: sticky
          top: 0
    > main
      grid-column-start: aside
</style>
