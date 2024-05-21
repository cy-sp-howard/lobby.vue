<script setup lang="ts">
import copy from '@/utils/copy'
import RkTip from './rkTip.vue'
import useLang from '@/utils/useLang'
const props = defineProps<{ text: string | number }>()

const { texts } = useLang()

function clickHandler(showText: () => void, closeText: () => void) {
  showText()
  setTimeout(closeText, 1000)
  copy(String(props.text))
}
</script>
<template lang="pug">
rk-tip(v-slot="{showText,closeText}" :text="texts['已复制']")
  button(:data-text="text" @click="clickHandler(showText,closeText)") 
</template>
<style lang="sass" scoped>
button
  font-size: 14px
  cursor: pointer
  display: inline-grid
  grid-template-columns: 1fr 20px
  gap: 5px
  &::before
    content: attr(data-text)
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap
  &::after
    content: ''
    // background: url('@img/copy.png') no-repeat center right
    background-size: contain
    display: inline-block
    height: 100%
  &:hover
    text-decoration: underline
  &:active
    transform: none !important
    color: #aaa
    &::after
      transform: scale(0.8)
</style>
