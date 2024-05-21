<script lang="ts" setup>
import { useWebStore } from '@/stores/web'
import { nextTick } from 'vue'
import { ref, watch } from 'vue'

const emit = defineEmits<(e: 'update:modelValue', val: unknown) => void>()
const props = defineProps<{
  modelValue: unknown
  opts: { label?: number | string; value: unknown }[]
}>()

const webStore = useWebStore()
const optRefs = ref<HTMLElement[]>([])
const activePos = ref(0)

watch(
  [() => props.modelValue, () => props.opts, () => webStore.size.vw],
  () => {
    nextTick(() => {
      const index = props.opts.findIndex(i => i.value === props.modelValue)
      const el = optRefs.value[~index ? index : 0]
      if (!el) return
      activePos.value = el.offsetLeft + el.offsetWidth / 2
    })
  },
  { immediate: true },
)

function clickHandler(val: unknown) {
  emit('update:modelValue', val)
}
</script>
<template lang="pug">
.rk-tab
  ul
    li(v-for="(i,index) in opts" :key="index" ref="optRefs" :class="{active: modelValue === i.value}" @click="clickHandler(i.value)") {{ i.label || i.value }}
  i.active-underline(v-if="activePos")
</template>
<style lang="sass" scoped>
.rk-tab
  padding-bottom: 15px
  overflow: auto
  > ul
    display: grid
    justify-content: start
    grid-auto-flow: column
    gap: 35px
    white-space: nowrap
    font-size: 16px
    line-height: 25px
    text-align: center
    border-bottom: 1px solid #D2D2D2
    > li
      color: #414141
      cursor: pointer
      &.active
        pointer-events: none
        text-shadow: 0 0 1px #406AFF
        color: #406AFF
      &:hover
        opacity: 1
  > .active-underline
    position: absolute
    bottom: 5px
    left: calc(v-bind(activePos) * 1px)
    transform: translateX(-50%)
    transition: left 0.1s linear
    display: grid
    grid-template-columns: 7px 7px
    grid-template-rows: 7px
    gap: 2px
    &::before,&::after
      content: ''
      border-radius: 1px
      background: #AABCFF
      animation: dot 2s linear 0s infinite
    &::after
      animation-delay: 1s
</style>
