<script lang="ts" setup>
import {
  computed,
  getCurrentInstance,
  onMounted,
  ref,
  reactive,
  nextTick,
  type InputHTMLAttributes,
} from 'vue'
import _ from 'lodash'
import { useWebStore } from '@/stores/web'
import useStorage from '@/utils/useStorage'
import useAnchorObserver from '@/utils/useAnchorObserver'
import RkScrollArea from './rkScrollArea.vue'

defineOptions({
  inheritAttrs: false,
})
const defaultStyle = {
  width: 'unset',
  top: 'unset',
  left: 'unset',
  bottom: 'unset',
  right: 'unset',
  maxHeight: 'unset',
}
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'selected'): void
  (e: 'enter'): void
}>()
const props = defineProps<{
  modelValue?: InputHTMLAttributes['value']
  focus?: boolean
  disabled?: boolean | number
  label?: string
  textarea?: boolean
  record?: number
  recordKey?: string | number
  recordTeleportTo?: string
}>()
const instance = getCurrentInstance()
const webStore = useWebStore()
const _recordKey = 'inputRecords-' + (props.recordKey || instance?.vnode.scopeId || '')
const { [_recordKey]: records } = useStorage({ [_recordKey]: [] as string[] })
const { triggerAnchor } = props.record
  ? useAnchorObserver(
      () => input.value,
      setRecordSize,
      () => recordVisible.value,
    )
  : { triggerAnchor() {} }

const input = ref<HTMLInputElement | null>(null)
const suffixRef = ref<HTMLElement | null>(null)
const suffixWidth = ref('15px')
const recordsRef = ref<HTMLElement | null>(null)
const recordVisible = ref(false)
const recordStyle = reactive(_.clone(defaultStyle))

const val = computed({
  get: () => props.modelValue,
  set: value => {
    if (props.disabled) return
    emit('update:modelValue', value as string)
  },
})
const className = computed(() => {
  return props.textarea ? 'rk-textarea' : 'rk-input'
})
const attrs = computed(() => {
  if (!instance || !instance.proxy) return {}
  const attrs = _.get(instance, 'proxy.$attrs', {})
  const input = _.pickBy(attrs, (i, k) => {
    const isCss = ['class', 'id', 'style'].includes(k)
    const isEvent = k.match(/^on[A-Z][a-z]*/)
    return !isCss && !isEvent
  })
  const div = _.chain(attrs).omit(_.keys(input)).value()
  props.record &&
    _.assign(input, { onFocus: showRecord, onBlur: () => closeRecord(1), onKeydown: nextRecord })
  return { div, input }
})
function getSuffixWidth() {
  if (suffixRef.value instanceof Element) {
    suffixWidth.value = `${suffixRef.value.offsetWidth}px`
  }
}
function setRecordSize(rect: DOMRectReadOnly) {
  if (!props.record) return
  _.assign(recordStyle, defaultStyle)
  const { left, right, width, top, bottom } = rect
  const rightRange = webStore.size.vw - right
  if (rightRange > left) {
    recordStyle.left = left + 'px'
  } else {
    recordStyle.right = rightRange + 'px'
  }
  const bottomRange = webStore.size.vh - top
  const recordMargin = 10
  if (bottomRange > 200) {
    recordStyle.top = bottom + recordMargin + 'px'
    recordStyle.maxHeight = bottomRange - 100 + 'px'
  } else {
    recordStyle.maxHeight = top - 100 + 'px'
    recordStyle.bottom = bottomRange + recordMargin + 'px'
  }
  recordStyle.width = width + 'px'
}
function showRecord() {
  if (!recordVisible.value) {
    recordVisible.value = true
    triggerAnchor()
    input.value?.select()
  }
}
function checkAllBlur() {
  if (!recordsRef.value || !input.value) return true
  return !recordsRef.value.matches(':hover') && document.activeElement !== input.value
}
function closeRecord(checkBlur = 0) {
  if (checkBlur && !checkAllBlur()) return
  recordVisible.value = false
}
function setRecord() {
  if (!val.value) return
  records.value = _.chain(records.value)
    .pull(val.value as string)
    .unshift(val.value as string)
    .take(props.record)
    .value()
}
function delReocrd(value: string) {
  _.pull(records.value, value)
  recordVisible.value = true
  focusInput()
}
function clickReocrd(value: string) {
  val.value = value
  emit('selected')
  blurInput()
  nextTick(setRecord)
}
function nextRecord(evt: KeyboardEvent) {
  let currentIndex = _.findIndex(records.value, i => i === props.modelValue)
  const recordLen = records.value.length
  switch (evt.key) {
    case 'Enter':
      emit('enter')
      blurInput()
      setRecord()
      break
    case 'Escape':
      blurInput()
      break
    case 'ArrowDown':
      currentIndex += 1
      if (currentIndex >= recordLen) currentIndex = 0
      val.value = records.value[currentIndex]
      focusInput()
      break
    case 'ArrowUp':
      currentIndex -= 1
      if (currentIndex < 0) currentIndex = recordLen - 1
      val.value = records.value[currentIndex]
      focusInput()
      break
  }
}
function blurInput() {
  input.value?.blur()
  closeRecord()
}
function focusInput() {
  setTimeout(() => {
    if (input.value) {
      input.value.focus()
      input.value.selectionStart = 9999
      input.value.selectionEnd = 9999
    }
  }, 0)
}

onMounted(() => {
  if (props.focus && input.value) {
    focusInput()
  }
  getSuffixWidth()
})
defineExpose({ input })
</script>
<template lang="pug">
label(v-bind="attrs.div" :class="className")
  textarea(v-if="textarea" ref="input" v-model="val" v-bind="attrs.input" :disabled="!!disabled")
  input(v-else ref="input" v-model="val" v-bind="attrs.input" :disabled="!!disabled")
  strong.label(v-if="label !== undefined || $slots.label") 
    slot(name="label" :label="label") {{ label }}
  span.suffix(v-if="$slots.suffix" ref="suffixRef")
    slot(name="suffix")
  teleport(v-if="record && recordVisible && records.length" :to="recordTeleportTo ||'body'")
    rk-scroll-area.input-records(:style="recordStyle")      
      ul(ref="recordsRef")
        li(v-for="(i,index) in records" :key="index" :class="{active:i===modelValue}" :data-text="i" @mousedown.self="clickReocrd(i)")
          svg-icon(icon="close" @mousedown="delReocrd(i)")
</template>
<style lang="sass" scoped>
.rk-input,.rk-textarea
  height: var(--rk-form-item-height)
  line-height: var(--rk-form-item-height)
  font-size: 14px
  color: var(--font-color)
  display: grid
  grid-template: 'label input' / auto 1fr
  &:focus-within,&:hover
    > input,> textarea
      border-color: #406AFF
    > .label
      color: #406AFF
  > .suffix
    grid-area: input
    justify-self: end
    display: flex
    padding: 0 10px
    justify-content: center
    align-items: center
    z-index: 1
  > .label
    font-size: 14px
    grid-area: label
    padding-right: 10px
    text-align: right
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis
  > input,> textarea
    display: block
    grid-area: input
    background: var(--rk-bg)
    height: 100%
    width: var(--rk-form-item-width)
    border-radius: 5px
    color: inherit
    font-size: inherit
    padding: 0 v-bind(suffixWidth) 0 15px
    border: 1px solid var(--rk-border)
    &:disabled
      cursor: not-allowed
      opacity: var(--rk-disabled-opacity)
      ~ .suffix
        opacity: var(--rk-disabled-opacity)
    &::placeholder
      color: #B1B1B1
.rk-textarea
  height: unset
  > textarea
    resize: none
    padding: 15px

.input-records
  position: fixed
  overflow: hidden
  z-index: var(--z-menu)
  box-shadow: 0 0 1px 1px #EBEBEB
  border-radius: 8px
  background: #fffa
  backdrop-filter: blur(3px)
  white-space: nowrap
  ul
    max-height: inherit
    padding: 10px 30px
    > li
      font-size: 14px
      color: #414141
      line-height: 40px
      cursor: pointer
      display: grid
      grid-template-columns: 1fr auto
      gap: 10px
      &::before
        content: '＃ 'attr(data-text)
        overflow: hidden
        text-overflow: ellipsis
        white-space: nowrap
      &:hover
        color: #406AFF
        font-weight: bold
      &.active
        font-weight: bold
      > svg
        align-self: center
        &:hover
          transform: scale(1.5)
</style>
