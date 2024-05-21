<script setup lang="ts">
import SearchLayout from '@/components/layout/searchLayout.vue'
import { computed, onMounted, ref, inject } from 'vue'
import _ from 'lodash'
import Games from '@/components/layout/games.vue'
import useLang from '@/utils/useLang'
import { GetFavoritePage } from '@/api/Page'
import type { RespData } from '@/utils/request'
import RkTab from '@/components/rkTab.vue'
import { FastGameKindCode } from '@/api/Game'
import Empty from '@/components/empty.vue'

const { webTexts } = useLang('Favorite')
const routeLoaded = inject('routeLoaded', () => {})
const loading = ref(1)
const kindIndex = ref(0)
const resp = ref<RespData<typeof GetFavoritePage> | null>(null)

const gamesRender = computed(() => {
  return _.chain(resp.value)
    .mapValues((i, k) => {
      return {
        key: FastGameKindCode[k as keyof typeof FastGameKindCode],
        kindName: webTexts.value[k],
        list: i,
      }
    })
    .filter(i => Boolean(i.list.length))
    .value()
})
const kindsRender = computed(() =>
  _.map(gamesRender.value, (i, index) => ({ label: i.kindName, value: index })),
)

onMounted(() => {
  GetFavoritePage()
    .then(({ Data }) => {
      resp.value = Data
    })
    .finally(() => {
      loading.value -= 1
      routeLoaded()
    })
})
</script>
<template lang="pug">
search-layout#fav
  rk-tab(v-model="kindIndex" :opts="kindsRender")
  .container(v-if="gamesRender.length" :key="kindIndex")
    games.fav-games(:list="gamesRender[kindIndex]?.list || []")
  .container(v-else)
    games(v-if="loading" :list="[]")
    empty(v-else)
</template>
<style lang="sass" scoped>
#fav
  :deep(> .search-header)
    border-bottom: 0
  :deep(> .search-body:not(.searching))
    padding: 0
    gap: 0
    > .rk-tab
      position: sticky
      top: -1px
      z-index: 1
      background: #fff
      > ul
        padding-right: var(--l-p-x)
        padding-left: var(--l-p-x)
    > .container
      padding: var(--l-p-y) var(--l-p-x)
      > .fav-games .game
        transition: opacity 0.2s
        &:not(.is-fav):not(.empty)
          opacity: 0.2
</style>
