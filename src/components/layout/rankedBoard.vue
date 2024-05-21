<script setup lang="ts">
import type { GetRankInfo } from '@/api/Member'
import rankAvatar from '@img/aaa.png'
import SectionTitle from '@/components/layout/sectionTitle.vue'
import useLang from '@/utils/useLang'
import { computed, ref, watch } from 'vue'
import _ from 'lodash'
const props = defineProps<{
  list: Awaited<ReturnType<typeof GetRankInfo>>[number]['RankData']['RankTable']
}>()

const { webTexts } = useLang()
const updated = ref(0)

const listRender = computed(() => {
  if (updated.value || props.list.length)
    return props.list.map(i => ({ avatar: rankAvatar, account: i.Account }))
  return _.times(6, () => ({ avatar: '', account: '' }))
})

watch(
  () => props.list,
  () => {
    updated.value += 1
  },
)
</script>
<template lang="pug">
section.ranked-board(v-if="listRender.length")
  section-title {{ webTexts['本周高手名单'] }}
  ul
    li(v-for="(i,index) in listRender" :key="index")
      div
        img(v-if="i.avatar" :src="i.avatar")
      span {{ i.account }}
</template>
<style lang="sass" scoped>
.ranked-board
  overflow: hidden
  > ul
    display: grid
    grid-auto-flow: column
    justify-content: start
    gap: 60px
    overflow: auto
    padding: 0 10px 10px
    width: 100%
    > li
      display: grid
      gap: 5px
      > div
        width: 82px
        height: 82px
        border-radius: 50%
        overflow: hidden
        padding: 3px
        background: linear-gradient(135deg, #406AFF 15%, #E2E8FF 30%, #406aff 50%, #d8e2ff 65%, #406AFF 85%)
        &:empty
          background: #eee
        > img
          width: 100%
          height: 100%
          border-radius: 50%
          object-fit: cover
          object-position: center
          border: 2px solid #fff
      > span
        font-size: 14px
        height: 15px
        color: #000
        text-align: center
        &:empty
          background: #eee
</style>
