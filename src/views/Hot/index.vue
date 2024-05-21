<script setup lang="ts">
import SearchLayout from '@/components/layout/searchLayout.vue'
import { onMounted, ref, computed, inject } from 'vue'
import _ from 'lodash'
import GuessTitle from '@/components/layout/guessTitle.vue'
import Tags from '@/components/layout/tags.vue'
import Games from '@/components/layout/games.vue'
import useLang from '@/utils/useLang'
import { GetHotGamePage } from '@/api/Page'
import type { RespData } from '@/utils/request'
import { FastGameKindCode } from '@/api/Game'
import Empty from '@/components/empty.vue'

const routeLoaded = inject('routeLoaded', () => {})
const { webTexts } = useLang('Hot')
const resp = ref<RespData<typeof GetHotGamePage> | null>(null)
const kind = ref(-1)
const loading = ref(1)

const tagOpts = computed(() => {
  return _.chain(resp.value)
    .omitBy((i, k) => !i.length || k === 'GameKindList')
    .map((i, k) => ({
      value: FastGameKindCode[k as keyof typeof FastGameKindCode],
      label: webTexts.value[k],
    }))
    .value()
})
const gamesRender = computed(() => {
  return _.chain(resp.value)
    .omit(['GameKindList'])
    .mapValues((i, k) => {
      return {
        title: webTexts.value[k],
        games: k === 'GameGuessLike' ? [] : i,
      }
    })
    .filter(i => Boolean(i.games.length))
    .filter(i => Boolean(!~kind.value || i.games?.[0]?.GameKind === kind.value))
    .value()
})

onMounted(() => {
  GetHotGamePage()
    .then(({ Data }) => {
      resp.value = Data
    })
    .finally(() => {
      loading.value = 0
      routeLoaded()
    })
})
</script>
<template lang="pug">
search-layout#hot
  games(:list="resp?.GameGuessLike || []" limit :default-row="1")
    template(#title)
      guess-title
  tags(v-model="kind" :opts="tagOpts" auto-reset-scroll :default-value="-1")
  games(v-for="(i) in gamesRender" :key="i.title + kind" :title="i.title" :list="i.games" :limit="!kind")
  template(v-if="!gamesRender.length")
    games(v-if="loading " :list="[]")
    empty(v-else)
</template>
<style lang="sass" scoped>
#hot
  :deep(.search-body)
    gap: 10px
  .tags
    position: sticky
    top: -1px
    z-index: 1
    background: #fff
    padding-top: 30px
</style>
