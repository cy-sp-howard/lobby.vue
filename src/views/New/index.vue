<script setup lang="ts">
import SearchLayout from '@/components/layout/searchLayout.vue'
import { onMounted, ref, computed, inject } from 'vue'
import Games from '@/components/layout/games.vue'
import useLang from '@/utils/useLang'
import { GetNewGamePage } from '@/api/Page'
import type { RespData } from '@/utils/request'
import GuessTitle from '@/components/layout/guessTitle.vue'
import _ from 'lodash'
import Tags from '@/components/layout/tags.vue'
import Empty from '@/components/empty.vue'

const { webTexts } = useLang('New')
const routeLoaded = inject('routeLoaded', () => {})
const loading = ref(1)
const kind = ref(-1)
const isEnd = ref(false)
const resp = ref<RespData<typeof GetNewGamePage> | null>(null)

const tagOpts = computed(() => {
  if (!resp.value) return []
  return _.map(resp.value.GameKindList, i => ({ label: webTexts.value[i.Key], value: i.Value }))
})
const gamesRender = computed(() => {
  return _.filter(resp.value?.GameAll, i => i.GameKind === kind.value || !~kind.value)
})

onMounted(() => {
  GetNewGamePage()
    .then(({ Data }) => {
      resp.value = Data
    })
    .finally(() => {
      routeLoaded()
      loading.value -= 1
    })
})
</script>
<template lang="pug">
search-layout#new(:scroll-padding="!isEnd" @searchstart="isEnd = false")
  games(:list="resp?.GameGuessLike || []" limit :default-row="1")
    template(#title)
      guess-title
  tags(v-model="kind" :opts="tagOpts" auto-reset-scroll :default-value="-1")
  template(v-if="!gamesRender.length")
    games(v-if="loading " :list="[]")
    empty(v-else)
  games(v-else :key="kind" :list="gamesRender" @end="isEnd = true")
</template>
<style lang="sass" scoped>
#new
  :deep(.search-body)
    gap: 30px
    .tags
      position: sticky
      top: -1px
      z-index: 1
      background: #fff
      padding-top: 10px
</style>
