<script setup lang="ts">
import Game from './game.vue'
import { watch, ref, nextTick, computed } from 'vue'
import _ from 'lodash'
import type { Game as GameItem } from '@/api/Game'
import SectionTitle from '@/components/layout/sectionTitle.vue'

const props = defineProps<{
  title?: string
  list: GameItem[]
}>()

const el = ref<HTMLElement | null>(null)
const repeat = ref(0)
const listChangeCount = ref(0)

const listRender = computed(() => {
  if (!props.list.length && !listChangeCount.value) {
    return _.times(10, i => ({
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
  }
  return _.chain(repeat.value + 1)
    .times(() => props.list)
    .flatten()
    .value()
})

watch(
  () => props.list,
  (ni, oi) => {
    if (oi) listChangeCount.value += 1
    if (!ni.length) return
    repeat.value = 0
    nextTick(setRepeat)
  },
  { immediate: true },
)

function setRepeat() {
  if (!el.value) return
  const { scrollWidth, offsetWidth } = el.value
  if (scrollWidth / 2 > offsetWidth) return
  repeat.value += 1
  nextTick(setRepeat)
}
</script>

<template lang="pug">
section.games(v-if="listRender.length" ref="el")
  slot(name="title")
    section-title(v-if="title") {{title}}
  .container
    template(v-for="r in 2" :key="r")
      game(v-for="(i,index) in listRender" :key="index" :item="i" :class="{'is-repeat': r=== 2}")
</template>
<style lang="sass" scoped>
section.games
  --game-min-width: 235px
  position: relative
  overflow: hidden
  > .container
    --item-count: v-bind(listRender.length)
    gap: 20px
    display: grid
    width: fit-content
    grid-auto-flow: column
    grid-auto-columns: var(--game-min-width)
    animation: move calc(var(--item-count) * 3s) linear infinite
    > .game.is-repeat
      transform: translateX(-10px)

@container main (width <= 800px)
  section.games
    --game-min-width: 120px

@keyframes move
  100%
    transform: translateX(-50%)
</style>
