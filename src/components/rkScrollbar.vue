<script lang="ts" setup>
import useSizeObserver from '@/utils/useSizeObserver'
import { computed, onBeforeUnmount, onMounted, reactive } from 'vue'
const props = withDefaults(
  defineProps<{
    reduce?: number
    getTarget: () => HTMLElement
    horizontal?: boolean
    mutationOpt?: { subtree?: boolean; childList?: boolean }
  }>(),
  {
    reduce: 0,
    horizontal: false,
    mutationOpt: () => ({ subtree: true, childList: false, attributes: true, interval: 200 }),
  },
)
const emit = defineEmits<{ (e: 'scroll', val: number): void }>()
useSizeObserver(props.getTarget, setBar, props.mutationOpt)
let target: HTMLElement | undefined
const moveData = {
  startY: 0,
  startT: 0,
}
const evtAbortCtrl = new AbortController()
let clickAbortCtrl = new AbortController()

const barData = reactive({
  wrapperHeight: 0,
  draging: false,
  height: 0,
  top: 0,
})

const barStyle = computed(() => {
  const isHori = props.horizontal
  return {
    transform: `translate${isHori ? 'X' : 'Y'}(${barData.top}px)`,
    [isHori ? 'width' : 'height']: `${barData.height}px`,
  }
})
const hidden = computed(() => {
  return barData.wrapperHeight <= barData.height
})

function setBar() {
  if (!target) return
  let { scrollHeight, offsetHeight } = target
  if (props.horizontal) {
    scrollHeight = target.scrollWidth
    offsetHeight = target.offsetWidth
  }
  barData.wrapperHeight = offsetHeight - props.reduce
  barData.height = (offsetHeight / scrollHeight) * (offsetHeight - props.reduce)
}
function scrollHanlder(this: HTMLElement, evt?: Event) {
  emit('scroll', this.scrollTop)
  if (barData.draging) return
  if (evt) evt.preventDefault()
  let { scrollTop, scrollHeight, offsetHeight } = this
  if (props.horizontal) {
    scrollTop = this.scrollLeft
    scrollHeight = this.scrollWidth
    offsetHeight = this.offsetWidth
  }
  barData.top = (scrollTop / scrollHeight) * (offsetHeight - props.reduce)
}
function listenScroll() {
  if (!target) return
  scrollHanlder.apply(target)
  target.addEventListener('scroll', scrollHanlder, { signal: evtAbortCtrl.signal })
}
function listenAnimate() {
  if (!target) return
  target.addEventListener('transitionend', setBar, { signal: evtAbortCtrl.signal, capture: true })
  target.addEventListener('animationend', setBar, { signal: evtAbortCtrl.signal, capture: true })
}
function mousedownHandler(evt: MouseEvent) {
  evt.preventDefault()
  let y = evt.y
  if (props.horizontal) {
    y = evt.x
  }
  moveData.startY = y
  moveData.startT = barData.top
  barData.draging = true

  clickAbortCtrl = new AbortController()
  addEventListener(
    'mouseup',
    () => {
      clickAbortCtrl?.abort()
      barData.draging = false
    },
    { signal: clickAbortCtrl.signal },
  )
  addEventListener('mousemove', mousemoveHandler, { signal: clickAbortCtrl.signal })
}
function mousemoveHandler(evt: MouseEvent) {
  if (!barData.draging) return
  evt.preventDefault()
  let y = evt.y
  if (props.horizontal) {
    y = evt.x
  }
  barData.top = moveData.startT + y - moveData.startY
  const bottomY = barData.wrapperHeight - barData.height
  if (barData.top < 0) barData.top = 0
  else if (barData.top > bottomY) barData.top = bottomY
  dragToScroll()
}
function dragToScroll() {
  if (!target) return
  if (props.horizontal) {
    target.scrollLeft = (barData.top / (target.offsetWidth - props.reduce)) * target.scrollWidth
    return
  }
  target.scrollTop = (barData.top / (target.offsetHeight - props.reduce)) * target.scrollHeight
}
onMounted(() => {
  target = props.getTarget()
  setBar()
  listenScroll()
  listenAnimate()
})
onBeforeUnmount(() => {
  clickAbortCtrl.abort()
  evtAbortCtrl.abort()
})
</script>
<template lang="pug">
blockquote.rk-scroll(ref='s', :class="{ hidden,horizontal }" :style='{ [horizontal?"width":"height"]: barData.wrapperHeight + "px" }')
  b(ref='b', :style='barStyle', @mousedown='mousedownHandler')
</template>
<style lang="sass" scoped>
blockquote
  --visible-w: 10px
  --trigger-w: 25px
  width: var(--visible-w)
  bottom: 0
  right: 0
  position: absolute
  z-index: var(--z-scroll)
  margin: 0
  opacity: 0.7
  &.hidden
    visibility: hidden
  &.horizontal
    width: unset
    height: var(--visible-w)
    > b
      height: var(--trigger-w)
      width: unset
      right: unset
      top: unset
      left: 0
      bottom: 0
      &::before
        height: var(--visible-w)
        width: 100%
  > b
    position: absolute
    top: 0
    right: 0
    width: var(--trigger-w)
    cursor: pointer
    &::before
      content: ''
      width: var(--visible-w)
      background: #999
      position: absolute
      right: inherit
      left: inherit
      top: inherit
      bottom: inherit
      height: 100%
      border-radius: 100px
    &:hover
      filter: brightness(1.1)
</style>
