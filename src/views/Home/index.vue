<script setup lang="ts">
import SearchLayout from '@/components/layout/searchLayout.vue'
import Banner from './banner.vue'
import Games from '@/components/layout/games.vue'
import Tags from '@/components/layout/tags.vue'
import { ref, inject, onMounted, computed, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import useLang from '@/utils/useLang'
import GuessTitle from '@/components/layout/guessTitle.vue'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { GameGuessLike, GameHot, GameNew, GameKindList } = storeToRefs(userStore)
const { texts, webTexts } = useLang('Home')
const routeLoaded = inject('routeLoaded', () => {})
const loading = ref(1)
const visible = reactive({ guess: true, hot: true, new: true })

const tagOpts = computed(() => {
  return GameKindList.value.map(i => ({ value: i.Value, label: webTexts.value[i.Key] }))
})

onMounted(() => {
  userStore.lastUpdate.promise
    .then(() => {
      routeLoaded()
      loading.value -= 1
    })
    .finally(() => {
      visible.guess = Boolean(GameGuessLike.value.length)
      visible.hot = Boolean(GameHot.value.length)
      visible.new = Boolean(GameNew.value.length)
    })
})
</script>
<template lang="pug">
search-layout#home
  template(#form="{postData,submit}")
    tags(v-model="postData.GameKind" :opts="tagOpts" :default-value="-1" @update:model-value="submit")
  template(#default)
    games(v-if="visible.guess" :list="GameGuessLike" limit :default-row="1")
      template(#title)
        guess-title
    banner
    games(v-if="visible.hot" :title="texts['热门排行']" :list="GameHot" limit)
    games(v-if="visible.new" :title="texts['新上架游戏']" :list="GameNew" limit)
</template>
<style lang="sass" scoped>
#home
  :deep(.search-header)
    background: #fff
    z-index: 1
    position: sticky
    top: -1px
</style>
