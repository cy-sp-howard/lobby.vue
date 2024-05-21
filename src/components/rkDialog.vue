<script setup lang="ts">
import { onMounted, provide, reactive, ref } from 'vue'
import useSizeObserver from '@/utils/useSizeObserver'
import _ from 'lodash'

provide('close', close)
defineProps<{ title?: string }>()
const emit = defineEmits<{ (e: 'closing'): void; (e: 'closed'): void }>()
const _setAlign = _.throttle(setAlign, 200)
useSizeObserver(() => el.value, _setAlign)

const el = ref<HTMLElement | null>(null)
const isAppear = ref(false)
const closing = ref(false)
const style = reactive({ alignItems: '', justifyContent: '' })

function close() {
  if (closing.value) return
  closing.value = true
  emit('closing')
}
function setAlign() {
  if (!el.value) return
  const { offsetHeight, offsetWidth, scrollHeight, scrollWidth } = el.value
  style.alignItems = scrollHeight <= offsetHeight ? 'center' : 'flex-start'
  style.justifyContent = scrollWidth <= offsetWidth ? 'center' : 'flex-start'
}

onMounted(_setAlign)
defineExpose({ close })
</script>
<template lang="pug">
.rk-dialog(
  ref="el"
  :style='style'
  @mousedown.self='close',
  @animationend.capture="_setAlign"
  @transitionend.capture="_setAlign"
)
  transition(
    name="dialog" appear @after-leave="closing && $emit('closed')" 
    @after-enter="isAppear = true"
    )
    .dialog-box(v-if="!closing")
      .box-header {{ title }}
      //- button(@click.prevent="close")
      //-   svg-icon(icon="close")
      .box-content
        slot
  rk-scroll(v-if="isAppear" :get-target="()=>el")
  rk-scroll(v-if="isAppear" :get-target="()=>el" horizontal)
</template>
<style lang="sass" scoped>
.rk-dialog
  --title-color: #000
  --title-bg: transparent
  --title-border: var(--rk-border)
  --shadow: #0006
  z-index: var(--z-dialog)
  display: flex
  justify-content: center
  position: fixed
  top: 0
  left: 0
  bottom: 0
  right: 0
  padding: 20px
  overflow: auto
  scrollbar-width: none
  overscroll-behavior: none
  &::-webkit-scrollbar
    display: none
  &::before
    content: ''
    z-index: -1
    position: fixed
    top: 0
    left: 0
    width: 100%
    height: 100%
    backdrop-filter: blur(3px)
    transition: backdrop-filter 0.2s
    pointer-events: none
  &:has(.dialog-leave-active)::before
    backdrop-filter: blur(0px)
  > .dialog-box
    border-radius: 15px
    background: var(--rk-bg)
    box-shadow: 0 0 10px var(--shadow)
    position: relative
    display: grid
    grid-template-rows: 105px auto
    &::before
      content: ''
      background: var(--title-border)
      height: 1px
      grid-area: 1 / 1 / span 1 / span 1
      align-self: flex-end
      position: absolute
      width: 100%
    > button
      grid-area: 1 / 1 / span 1 / span 1
      justify-self: flex-end
      align-self: center
      color: var(--title-color)
      display: flex
      transform: translateX(-20px)
      align-items: center
      justify-content: center
      cursor: pointer
      border-radius: 5px
      width: 30px
      height: 30px
      font-size: 30px
      &:hover
        box-shadow: 0 0 0 1px LightSkyBlue
      > svg
        transform: scale(1.1)
    > .box-header
      grid-area: 1 / 1 / span 1 / span 1
      font-size: 24px
      align-self: end
      padding: 0 100px 20px 50px
      background: var(--title-bg)
      color: var(--title-color)
      overflow: hidden
      white-space: nowrap
      text-overflow: ellipsis
    > .box-content
      padding: 20px
      border-radius: 0 0 5px 5px
      > :deep(*)
        min-width: 160px
  .rk-scroll
    position: fixed
    opacity: 1
.dialog-enter-active
  animation: dialog-fade .3s
.dialog-leave-active
  animation: dialog-fade .3s reverse
@keyframes dialog-fade
  0%
    opacity: 0
    transform: scale(.95)
  50%
    opacity: 0.75
  to
    opacity: 1
    transform: scale(1)
</style>
