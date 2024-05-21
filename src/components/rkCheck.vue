<script lang="ts" setup>
import { computed } from 'vue'
import _ from 'lodash'

type opt = {
  label?: string | number
  value: unknown | unknown[]
}
const emit = defineEmits<{ (e: 'update:modelValue', value?: opt['value']): void }>()
const props = defineProps<{
  modelValue?: unknown
  defaultValue?: unknown //單選時，未選擇任何選項的值
  disabled?: boolean | number
  label?: string
  opts: opt[]
  multiple?: boolean
  required?: boolean
  tag?: string
}>()

const optsRender = computed(() => {
  return _.map(props.opts, i => {
    return {
      value: i.value,
      label: String(!i.label && typeof i.label !== 'string' ? i.value : i.label),
      active:
        _.isEqual(props.modelValue, i.value) ||
        _.some(props.modelValue as unknown[], val => _.isEqual(val, i.value)),
    }
  })
})

function handleClick(val: unknown) {
  if (props.disabled) return
  else if (!props.multiple) {
    if (!props.required && _.isEqual(props.modelValue, val))
      emit('update:modelValue', props.defaultValue)
    else emit('update:modelValue', val)
  } else if (Array.isArray(props.modelValue)) {
    const value = _.reject(props.modelValue, i => _.isEqual(i, val))
    if (value.length === props.modelValue.length) {
      value.push(val)
    }
    if (!value.length && props.required) {
      if (props.opts.length > 1) {
        const delIndex = _.findIndex(props.opts, i => i.value === val)
        emit('update:modelValue', [props.opts[+!delIndex].value])
      }
      return
    }
    emit('update:modelValue', value)
  } else {
    emit('update:modelValue', [val])
  }
}
</script>
<template lang="pug">
component.rk-check(:is="tag||'label'" :class="{disabled}")
  span.wrapper
    b(v-for="(i,index) in optsRender" :key="index" :class="{active:i.active}" :data-label="i.label" @click="handleClick(i.value)")
  strong.label(v-if="label !== undefined || $slots.label")
    slot(name="label") {{  label }}
</template>
<style lang="sass" scoped>
.rk-check
  line-height: var(--rk-form-item-height)
  font-size: 14px
  display: grid
  grid-auto-flow: column
  grid-template-columns: auto 1fr
  &.disabled > .wrapper > b
    cursor: not-allowed
    opacity: var(--rk-disabled-opacity)
    &::before
      opacity: inherit
  > .label
    font-size: 14px
    grid-column: 1 / span 1
    padding-right: 10px
    text-align: right
  > .wrapper
    display: flex
    flex-wrap: wrap
    justify-content: flex-start
    gap: 5px 10px
    padding-left: 2px
    width: var(--rk-form-item-width)
    &:hover
      + .label
        color: LightSkyBlue
    > b
      display: grid
      grid-auto-flow: column
      gap: 5px
      cursor: pointer
      &::before
        content: ''
        height: 10px
        width: 10px
        border-radius: 2px
        border: 1px solid var(--rk-bg)
        box-shadow: 0 0 0 1px currentColor
        align-self: center
        background: var(--rk-bg)
      &::after
        content: attr(data-label)
        white-space: nowrap
      &:hover
        color: LightSkyBlue
      &.active::before
        background: currentColor
</style>
