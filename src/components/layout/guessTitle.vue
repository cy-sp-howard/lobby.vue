<script setup lang="ts">
import useLang from '@/utils/useLang'
import SectionTitle from './sectionTitle.vue'
const { webTexts } = useLang()
</script>
<template lang="pug">
section-title {{webTexts['猜你喜欢']}}
  span
    i(v-for="i in 4" :key="i")
</template>
<style lang="sass" scoped>
@use 'sass:math'
h1 > span
  display: inline-grid
  grid-auto-flow: column
  grid-auto-columns: 9px
  grid-template-rows: 9px
  padding-left: 10px
  vertical-align: middle
  gap: 2px
  > i
    background: #AABCFF
    border-radius: 1px
    $duration: 2s
    animation: dot $duration linear var(--delay) infinite
    @for $i from 1 through 4
      &:nth-child(#{$i})
        --delay: #{($i - 1) * math.div($duration,4)}
</style>
