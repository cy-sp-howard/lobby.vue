<script setup lang="ts">
import { useWebStore } from '@/stores/web'
import { watch, onMounted, ref, provide } from 'vue'
import AccountLink from './accountLink.vue'
import { useRoute, RouterView } from 'vue-router'
import logo from '@img/logo.jpg'
import useLang from '@/utils/useLang'
import ToTop from '@/components/layout/toTop.vue'

defineOptions({ name: 'Layout' })
const webStore = useWebStore()
const route = useRoute()
const { rootTexts } = useLang()
// const moreTypes = ref(false)
const mainRef = ref<HTMLElement | null>(null)
const routeWidth = ref(0)
const asideHidden = ref(webStore.size.vw < 1600)

watch(() => webStore.size.vw, getRouteWidth)
watch(() => route.name, mainClickHandler, { immediate: true })

function getRouteWidth() {
  if (!mainRef.value) return
  routeWidth.value = mainRef.value.offsetWidth
}
function mainClickHandler() {
  if (webStore.size.vw < 1280) return toggleAside(true)
}
// function setMoreHeight(el: Element) {
//   if (!(el instanceof HTMLElement)) return
//   el.style.height = el.scrollHeight + 'px'
// }
function toggleAside(val = !asideHidden.value) {
  asideHidden.value = val
}

onMounted(getRouteWidth)
provide('gamesContainerWidth', routeWidth)
</script>
<template lang="pug">
.layout 
  aside(:class="{hidden:asideHidden}" @transitionend.self="getRouteWidth")
    .top
      button.menu(@click="toggleAside()")
        svg-icon(icon="menu")
      button.logo(@click="$router.push('/')")
        img(:src="logo")
    router-link.pin.fav(:to="{name:'Favorite'}") {{rootTexts.Favorite.routeName}}
    router-link(:to="{name:'History'}") {{rootTexts.History.routeName}}
    //- a(href="#") 稍後遊戲
    hr
    router-link.pin.egame(:to="{name:'EGame'}") {{rootTexts.EGame.routeName}}
    router-link.pin.live(:to="{name:'Live'}") {{rootTexts.Live.routeName}}
    router-link.pin.lottery(:to="{name:'Lottery'}") {{rootTexts.Lottery.routeName}}
    //- small(:class="{active: moreTypes}" @click="moreTypes = !moreTypes") 更多遊戲
    //- transition(name="more" @enter="setMoreHeight" @leave="setMoreHeight")
    //-   .more(v-if="moreTypes")
    //-     a(href="#") 打牌
    //-     a(href="#") 喝酒
    //-     a(href="#") 跳舞
    //- hr
    //- a(href="#") 投注優惠
    //- a(href="#") 每日簽到
    //- a(href="#") 累積勝場賽
    //- a.more(href="#") 其他活動
    hr
    router-link.pin.hot(:to="{name:'Hot'}") {{rootTexts.Hot.routeName}}
    router-link(:to="{name:'Recommend'}") {{rootTexts.Recommend.routeName}}
    router-link(:to="{name:'New'}") {{rootTexts.New.routeName}}
    //- a(href="#") 新加入供應商
  main(ref="mainRef" @click="mainClickHandler")
    slot
      account-link
      router-view
  to-top
</template>
<style lang="sass" scoped>
.layout
  display: grid
  grid-template: 'aside main' / auto 1fr
  min-height: 100vh
  min-height: 100dvh
  min-width: 300px
  > aside
    position: sticky
    top: 0px
    grid-area: aside
    display: grid
    z-index: 1
    line-height: 40px
    gap: 5px
    background: #fff
    align-content: start
    height: 100vh
    height: 100dvh
    overflow: auto
    overflow-x: hidden
    padding-bottom: 100px
    user-select: none
    width: 265px
    white-space: nowrap
    transition: width 0.2s,background 0.2s
    > .top
      transition: all .2s
      background: inherit
      line-height: 1
      font-size: 18px
      height: 85px
      position: sticky
      padding-top: 10px
      top: -1px
      display: grid
      grid-auto-flow: column
      gap: 15px
      justify-content: start
      align-items: center
      color: #363636
      width: 100%
      z-index: 1
      padding-left: 22px
      > .logo > img
        object-fit: contain
        mix-blend-mode: multiply
        cursor: pointer
        &:hover
          filter: brightness(1.05)
      > .menu
        cursor: pointer
        font-size: 15px
        transition: background .2s
        width: 35px
        height: 35px
        border-radius: 50%
        &:hover
          background: #EBEFFF
    a,> small
      font-size: 16px
      color: #000000
      display: grid
      grid-template-columns: auto 1fr
      justify-content: start
      cursor: pointer
      position: relative
      &::before
        content: ''
        background: url(@/assets/svg/down.svg) no-repeat right 20px center
        background-size: 15px
        vertical-align: top
        width: 80px
        display: inline-block
        height: 100%
        visibility: hidden
      &::after
        content: ''
        align-self: center
        transform: translateX(15px)
        position: absolute
        display: block
        grid-area: 1 / 1 / span 1 / span 2
        background: transparent
        transition: background .2s
        width: 220px
        height: 100%
        border-radius: 5px
        z-index: -1
      &.router-link-active,&:hover
        color: #406AFF
        font-weight: bold
        &::after
          background: #EBEFFF
    > small
      transition: opacity 0.2s
      padding: 0
      &::before
        visibility: visible
      &.active
        opacity: 0.2
    > hr
      width: 230px
      margin: 10px 0
      transform: translateX(15px)
      border-width: 0
      border-top: 1px solid #f2f2f2
  > main
    grid-area: main
    // overflow-x: hidden
    position: relative
    container: main / inline-size
    > .account-link
      position: absolute
      top: 0
      right: 0

.more-enter-active
  animation: extend .2s
  overflow: hidden
.more-leave-active
  overflow: hidden
  animation: extend .2s reverse


@media (width > 800px)
  .layout
    > aside.hidden
      width: 80px
      justify-items: center
      > *:not(.top):not(.pin)
        display: none
      > .top > .logo
        display: none
      > a
        grid-template: 'icon' 40px 'text' 25px
        align-content: start
        font-size: 14px
        line-height: 1
        &::before
          visibility: visible
          width: unset
          background: var(--icon) no-repeat center center
          background-size: 20px
        &::after
          width: 65px
          transform: none
          justify-self: center
          grid-row-end: span 2
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
// 大於等於1280，main會因aside顯示隱藏，寬度隨之變動，css需使用@container監測寬度變化
@media (width > 800px) and (width < 1280px)
  .layout
    grid-template: 'aside main' / 80px 1fr
    > aside
      grid-column-end: main-end


@media (width <= 800px)
  .layout
    > aside.hidden
      width: 50px
      overflow: hidden
      background: transparent
      pointer-events: none
      > *:not(.top)
        opacity: 0
      > .top
        pointer-events: all
        padding-left: 10px
        padding-top: 0
        height: 55px
        > .menu
          background: #EBEFFF99
          box-shadow: 0 0 1px #ccc
    > main
      grid-column-start: aside-start

@container main (width <= 800px)
  .account-link
    position: relative !important
    padding: 10px
    > span
      font-size: 14px
      white-space: nowrap
</style>
