<script setup lang="ts">
import SearchLayout from '@/components/layout/searchLayout.vue'
import { onMounted, ref, inject } from 'vue'
import Games from '@/components/layout/games.vue'
import { GetRecentPlayPage } from '@/api/Page'
import type { RespData } from '@/utils/request'
import Empty from '@/components/empty.vue'

const routeLoaded = inject('routeLoaded', () => {})
const loading = ref(1)
const resp = ref<RespData<typeof GetRecentPlayPage>['GameAll']>([])

onMounted(() => {
  GetRecentPlayPage()
    .then(({ Data }) => {
      resp.value = Data.GameAll
    })
    .finally(() => {
      routeLoaded()
      loading.value -= 1
    })
})
</script>
<template lang="pug">
search-layout#history
  template(v-if="!resp.length")
    games(v-if="loading " :list="[]")
    empty(v-else)
  games(v-else :list="resp")
</template>
