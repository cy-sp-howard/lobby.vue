<script setup lang="ts">
import Game from './game.vue'
import { inject, watch, ref, nextTick, computed, type Ref } from 'vue'
import _ from 'lodash'
import type { Game as GameItem } from '@/api/Game'
import { useWebStore } from '@/stores/web'
import SectionTitle from '@/components/layout/sectionTitle.vue'

const emit = defineEmits<{ (e: 'end' | 'visible'): void; (e: 'resize', cellCount: number): void }>()
const props = defineProps<{
  title?: string
  list: GameItem[]
  limit?: boolean
  defaultRow?: number
  maxEmptyRow?: number
  statistic?: boolean
}>()
const fillRowCellCount = 6
const defaultRowCount = props.defaultRow || 2
let emittedEnd = false

const rootScrollTop = inject<(() => number) | Ref<number>>(
  'gamesRootScrollTop',
  () => webStore.scrollPos.y,
)
const rootOffsetHeight = inject<typeof rootScrollTop>(
  'gamesRootOffsetHeight',
  () => webStore.size.vh,
)
const gamesContainerWidth = inject<typeof rootScrollTop>('gamesContainerWidth', ref(0))
const webStore = useWebStore()
const containerRef = ref<null | HTMLElement>(null)
const listChangeCount = ref(-1)
const cellCount = ref(fillRowCellCount)
const rowCount = ref(defaultRowCount)

const gameRenderCount = computed(() => cellCount.value * rowCount.value)
const listRender = computed(() => {
  const _count = gameRenderCount.value
  const defaultList: GameItem[] = _.times(_count, i => ({
    GameCode: String(i * -1),
    GameType: -1,
    GameKind: -1,
    GameChineseName: '',
    GameEnglishName: '',
    PlatformChineseName: '',
    PlatformEnglishName: '',
    IsFavorite: false,
    Platform: '',
    Count: 0,
  }))
  const _list = props.list.concat(defaultList)
  const emptyRowCount = isEmpty.value ? 0 : _.floor((_count - props.list.length) / cellCount.value)

  const delCount = emptyRowCount >= 1 ? emptyRowCount * cellCount.value : 0
  return _list.slice(0, _count - delCount)
})
const isEmpty = computed(() => !props.list.length)
const hidden = computed(() => listChangeCount.value && isEmpty.value)

watch(
  gamesContainerWidth,
  (ni, oi) => {
    nextTick(() => setCell(oi === undefined))
  },
  { immediate: true },
)
watch(
  () => props.list,
  () => {
    listChangeCount.value += 1
    rowCount.value = defaultRowCount
    emittedEnd = false
    nextTick(setRow)
  },
  { immediate: true },
)
watch(
  () => props.limit,
  () => {
    throw new Error('dont change limit prop')
  },
)
watch([rootScrollTop, rootOffsetHeight], _.throttle(setRow, 200))

function setCell(firstTime: boolean) {
  if (!containerRef.value) return
  const elWidth = containerRef.value.offsetWidth
  cellCount.value = fillRowCellCount
  nextTick(() => {
    if (!containerRef.value) return
    const maxCount =
      _.findIndex(containerRef.value.children, i => {
        if (i instanceof HTMLDivElement) {
          return i.offsetWidth + i.offsetLeft >= elWidth - 5
        }
        return false
      }) + 1

    if (!firstTime && (!maxCount || cellCount.value === maxCount)) return
    cellCount.value = maxCount
    emit('resize', cellCount.value)
  })
}
function setRow() {
  if (import.meta.env.SSR || props.limit || !containerRef.value || emittedEnd) return
  const vh = rootOffsetHeight instanceof Function ? rootOffsetHeight() : rootOffsetHeight.value
  const { bottom } = containerRef.value.getBoundingClientRect()
  // if((top >0 && top <= clientHeight / 2) || (bottom <= clientHeight && bottom >= clientHeight / 2) ){
  //   emit('visible')
  // }
  const needMore = bottom - 200 <= vh
  if (!needMore) return

  const endRowRendered = !isEmpty.value && props.list.length <= gameRenderCount.value
  if (endRowRendered) {
    // next page req
    emittedEnd = true
    emit('end')
    return
  }
  //  fill it
  if (isEmpty.value && props.maxEmptyRow && rowCount.value >= props.maxEmptyRow) {
    return
  }
  rowCount.value += defaultRowCount

  nextTick(setRow)
}
</script>

<template lang="pug">
section.games(v-if="!hidden")
  slot(name="title")
    section-title(v-if="title") {{title}}
  .container(ref="containerRef")
    game(v-for="(i,index) in listRender" :key="index" :item="i" :statistic="statistic")
</template>
<style lang="sass" scoped>
section.games
  --game-min-width: 235px
  position: relative
  > .container
    gap: 20px
    display: grid
    grid-template-columns: repeat(auto-fit,minmax(var(--game-min-width),1fr))

@container main (width <= 800px)
  section.games
    --game-min-width: 120px
</style>
