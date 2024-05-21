<script setup lang="ts">
import defaultPic from '@img/aaa.png'
import type { Game } from '@/api/Game'
import { useWebStore } from '@/stores/web'
import { computed, ref } from 'vue'
import { SetFav } from '@/api/Member'
import gameRef from '@/utils/gameRef'
import useLang from '@/utils/useLang'
import RkTip from '../rkTip.vue'
import { useRoute, useRouter } from 'vue-router'
import _ from 'lodash'

const props = defineProps<{
  item: Game
  statistic?: boolean
}>()
const webStore = useWebStore()
const { webTexts } = useLang()
const router = useRouter()
const route = useRoute()

const itemReactive = gameRef(computed(() => props.item))
const apiMsg = ref('')

const picShow = computed(() => Boolean(itemReactive.value.Platform))
const name = computed(
  () =>
    (webStore.lang.includes('zh')
      ? itemReactive.value.GameChineseName
      : itemReactive.value.GameEnglishName) || itemReactive.value.GameEnglishName,
)
const subText = computed(() => {
  if (props.statistic) return `${itemReactive.value.Count} ${webTexts.value['人收藏']}`
  return webStore.lang.includes('zh')
    ? itemReactive.value.PlatformChineseName
    : itemReactive.value.PlatformEnglishName
})
const pic = computed(() => {
  const path = `/${itemReactive.value.Platform}/${itemReactive.value.GameCode}`
  const picURL = path
  if (itemReactive.value.picExt) return `${picURL}.${itemReactive.value.picExt}`
  return defaultPic
})

function nextPicExt() {
  switch (itemReactive.value.picExt) {
    case 'png':
      itemReactive.value.picExt = 'jpg'
      break
    default:
      itemReactive.value.picExt = ''
      break
  }
}
function playGame() {
  if (!name.value) return
  const go = route.name === 'Playing' ? router.replace : router.push
  go({
    name: 'Playing',
    query: { t: Date.now() },
    state: {
      game: _.pick(itemReactive.value, [
        'GameEnglishName',
        'GameCode',
        'GameKind',
        'GameType',
        'Platform',
      ]),
    },
  })
}
function setFav(showText: () => void, closeText: () => void) {
  if (!name.value) return
  const originVal = itemReactive.value.IsFavorite
  SetFav({ Type: Number(originVal) + 1, GameCode: itemReactive.value.GameCode }).catch(err => {
    if (!(err instanceof Error)) return
    apiMsg.value = err.message
    itemReactive.value.IsFavorite = originVal
    showText()
    setTimeout(closeText, 3000)
  })
  itemReactive.value.IsFavorite = !itemReactive.value.IsFavorite
}
</script>
<template lang="pug">
.game(:class="{empty: !name,'is-fav':itemReactive.IsFavorite}")
  .img-wrapper(@click="playGame")
    img(v-if="picShow" :src="pic" @error="nextPicExt")
  .img-text
    strong {{ name }}
    small {{ subText }}
    .actions
      rk-tip(v-slot="{showText,closeText}" :text="apiMsg" absolute :to="false") 
        button(@click="setFav(showText,closeText)")
          svg-icon(icon="heart")
</template>
<style lang="sass" scoped>
.game
  display: grid
  grid-template-rows: auto 45px
  align-content: start
  // overflow: hidden
  border-radius: 8px
  &:hover img
    transform: scale(1.05)
    transition: transform .1s
  > .img-wrapper
    padding-bottom: 68%
    position: relative
    cursor: pointer
    overflow: hidden
    border-radius: 8px
    background: #eee
    > img
      object-fit: cover
      border-radius: 8px
      width: 100%
      height: 100%
      left: 0
      top: 0
      position: absolute
  > .img-text
    display: grid
    grid-template: 'title actions' 'sub actions' / 1fr auto
    > strong
      grid-area: title
      font-size: 15px
      color: #000
      overflow: hidden
      white-space: nowrap
      text-overflow: ellipsis
    > small
      grid-area: sub
      font-size: 15px
      overflow: hidden
      white-space: nowrap
      text-overflow: ellipsis
      color: #B7B7B7
      transform: translateY(-5px)
    > .actions
      grid-area: actions
      display: grid
      grid-auto-flow: column
      align-items: center
      position: relative
      user-select: none
      > button
        color: #C4C4C4
        font-size: 22px
        line-height: 1
        &:hover > svg
          transform: scale(1.2)
        &:active
          transform: scale(0.8) !important

  &.is-fav .actions > button
    color: #406AFF
  &.empty
    pointer-events: none
    > .img-wrapper > *
      visibility: hidden
    > .img-text
      > strong, > small
          &:empty::before
            content: ''
            background: #eee
            display: block
            width: 80%
            height: 100%
            transform: scaleY(0.5)
      > small:empty::before
        width: 50%
      > .actions
        visibility: hidden
  &:not(.empty) ~ .empty
    visibility: hidden
</style>
