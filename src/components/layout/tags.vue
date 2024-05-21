<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: unknown
  opts: { label?: number | string; value: unknown }[]
  defaultValue?: number
  autoResetScroll?: boolean
}>()
const emit = defineEmits<{ (e: 'update:modelValue', val: unknown): void; (e: 'unselect'): void }>()

const el = ref<HTMLElement | null>(null)

function clickHandler(item: (typeof props)['opts'][number]) {
  if (props.autoResetScroll) resetSroll()
  if (item.value === props.modelValue) {
    emit('unselect')
    emit('update:modelValue', props.defaultValue)
  } else emit('update:modelValue', item.value)
}
function resetSroll() {
  setTimeout(() => {
    if (el.value) {
      document.documentElement.scrollTop = 0
      document.documentElement.scrollTop = el.value.getBoundingClientRect().y
    }
  }, 0)
}
</script>
<template lang="pug">
ul.tags(ref="el")
  li(v-for="(i,index) in opts" :key="index" :class="{active: i.value === modelValue}" @click="clickHandler(i)") {{ i.label ?? i.value }}
  slot(:click-handler="clickHandler")
</template>
<style lang="sass" scoped>
ul.tags
  display: flex
  text-align: center
  gap: 15px
  line-height: 33px
  justify-content: start
  align-content: start
  user-select: none
  overflow: auto
  padding-bottom: 10px
  &:empty
    display: none
  :deep(> li)
    flex-basis: 80px
    color: #406AFF
    background: #EBEFFF
    font-size: 14px
    border-radius: 5px
    cursor: pointer
    padding: 0 10px
    white-space: nowrap
    &:hover
      box-shadow: inset 0 0 0 1px #375EEB
    &.active
      color: white
      background: linear-gradient(to bottom, #7190FE, #375EEB)
</style>
