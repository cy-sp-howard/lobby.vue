<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref } from 'vue'
import useAnchorObserver from '@/utils/useAnchorObserver'
import { useWebStore } from '@/stores/web'
import RkInput from './rkInput.vue'
import _ from 'lodash'
type opt = {
  label?: string | number
  value: string | number | undefined | null
}

const webStore = useWebStore()
const emit = defineEmits<{
  (e: 'update:modelValue', value?: opt['value'] | opt['value'][]): void
}>()
const props = defineProps<{
  menuClass?: Record<string, string> | string
  menuParent?: string
  opts: opt[]
  label?: string
  tag?: string
  disabled?: boolean | number
  placeholder?: string
  modelValue?: opt['value'] | opt['value'][]
  multiple?: boolean
}>()
const { triggerAnchor } = useAnchorObserver(
  getAnchorTarget,
  setMenuSize,
  () => selecting.value,
  closeMenu,
)
const defaultStyle = {
  minWidth: 'unset',
  top: 'unset',
  left: 'unset',
  bottom: 'unset',
  right: 'unset',
  maxHeight: 'unset',
  maxWidth: 'unset',
}
let preventClose = false
let abortCtrl = new AbortController()

const menuStyle = reactive(_.clone(defaultStyle))
const selecting = ref(false)
const searchText = ref('')
const input = ref<{ input: HTMLElement } | null>(null)
const el = ref<HTMLElement | null>(null)
const menu = ref<HTMLElement | null>(null)

const optsRender = computed(() => {
  return _.map(props.opts, i => {
    return {
      label: String(!i.label && typeof i.label !== 'string' ? i.value : i.label),
      value: i.value,
    }
  })
})
const optsFilter = computed(() => {
  const ary = _.uniq(searchText.value)
  return _.chain(optsRender.value)
    .filter(i => {
      return _.chain(ary).difference(_.map(i.label)).isEqual([]).value()
    })
    .map(i => {
      const currentVal = currentOpt.value.value
      const selected =
        props.multiple && _.isArray(currentVal)
          ? _.some(currentVal, v => _.isEqual(v, i.value))
          : _.isEqual(i.value, currentVal)

      return _.assign({ selected }, i)
    })
    .value()
})
const currentOpt = computed(() => {
  if (props.multiple) {
    const vals = _.isArray(props.modelValue) ? props.modelValue : [props.modelValue]

    return {
      label: _.chain(optsRender.value)
        .filter(i => {
          return _.some(vals, val => _.isEqual(val, i.value))
        })
        .map('label')
        .join(',')
        .value(),
      value: vals,
    }
  }
  return (
    _.find(optsRender.value, i => _.isEqual(i.value, props.modelValue)) || {
      label: props.modelValue,
      value: props.modelValue,
    }
  )
})
const inputAttrs = computed(() => {
  const attrs: {
    disabled: typeof props.disabled
    label: typeof props.label
    modelValue?: unknown
    placeholder?: string
    readonly?: boolean
    'onUpdate:modelValue'?: (val: unknown) => unknown
  } = {
    disabled: props.disabled,
    label: props.label,
  }
  if (selecting.value) {
    attrs.modelValue = searchText.value
    attrs.placeholder = currentOpt.value.label as string
    attrs['onUpdate:modelValue'] = e => {
      searchText.value = e as string
    }
  } else {
    attrs.modelValue = currentOpt.value.label
    attrs.placeholder = props.placeholder
    attrs.readonly = true
  }
  return attrs
})

function selectOpt(opt: opt) {
  if (props.disabled) return
  if (props.multiple) {
    const vals = _.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
    if (_.some(vals, i => _.isEqual(i, opt.value))) {
      emit(
        'update:modelValue',
        _.reject(vals, i => _.isEqual(i, opt.value)),
      )
    } else {
      emit('update:modelValue', [opt.value].concat(vals))
    }
    return
  }
  emit('update:modelValue', opt.value)
}
function openMenu() {
  if (props.disabled) return
  if (selecting.value) {
    return (preventClose = true)
  }
  selecting.value = true
  preventClose = true
  triggerAnchor()
  abortCtrl = new AbortController()
  addEventListener('mousedown', closeMenu, { signal: abortCtrl.signal })
  nextTick(() => {
    menu.value?.querySelector('.selected')?.scrollIntoView({ block: 'center' })
  })
}
function closeMenu(evt?: MouseEvent) {
  if (preventClose) {
    return (preventClose = false)
  }
  const evtTarget = evt?.target as HTMLElement | undefined
  const isSelf = menu.value === evtTarget?.parentElement
  if (props.multiple && isSelf) return
  selecting.value = false
  searchText.value = ''
  abortCtrl.abort()
}
function setMenuSize(rect: DOMRectReadOnly) {
  _.assign(menuStyle, defaultStyle)
  const { left, right, width, top, bottom } = rect
  const rightRange = webStore.size.vw - right
  if ((rightRange > left || rightRange < 0) && left >= 0) {
    menuStyle.left = left + 'px'
    if (left + width > webStore.size.vw) {
      menuStyle.maxWidth = webStore.size.vw - left + 'px'
    }
  } else {
    const _rightRange = rightRange < 0 ? 0 : rightRange
    menuStyle.right = _rightRange + 'px'
    if (_rightRange + width > webStore.size.vw) {
      menuStyle.maxWidth = webStore.size.vw - _rightRange + 'px'
    }
  }
  const bottomRange = webStore.size.vh - top
  if (bottomRange > 200) {
    menuStyle.top = bottom + 10 + 'px'
    menuStyle.maxHeight = bottomRange - 100 + 'px'
  } else {
    menuStyle.maxHeight = top - 100 + 'px'
    menuStyle.bottom = bottomRange + 10 + 'px'
  }
  if (menuStyle.maxWidth !== 'unset') return
  menuStyle.minWidth = width + 'px'
}
function getAnchorTarget() {
  return input.value?.input || el.value
}

onBeforeUnmount(closeMenu)
</script>
<template lang="pug">
component.rk-select(:is="tag||'div'" ref="el" :class="{selecting,disabled}" @mousedown="openMenu")
  slot(v-bind="currentOpt")
    rk-input(ref="input" v-bind="inputAttrs")
      template(#suffix)
        svg-icon(icon="down")
  teleport(v-if="selecting" :to="menuParent||'body'")
    .menu(:style="menuStyle" :class="menuClass")
      ul(ref="menu")
        li(v-for="(i,index) in optsFilter" :key="index" :class="{selected:i.selected}" @mousedown="selectOpt(i)") {{ i.label || i.value }}
      rk-scroll(:get-target="()=>$refs.menu" @mousedown="preventClose = true")
</template>

<style lang="sass" scoped>
.rk-select
  cursor: pointer
  height: var(--rk-form-item-height)
  line-height: var(--rk-form-item-height)
  font-size: 14px
  display: grid
  &.selecting > :deep(.rk-input)
    > input
      border-color:  LightSkyBlue
    > .suffix > svg
      color: LightSkyBlue
  > :deep(.rk-input)
    grid-area: 1 / 1 / span 1 / span 1
    height: inherit
    line-height: inherit
    width: inherit
    font-size: inherit
    > input
      padding-right: 30px
      background: #F7F7F7
      color: #000
      &:not(:disabled)
        cursor: pointer
        &::placeholder
          color: var(--rk-border)
      &:disabled ~ .suffix
        opacity: var(--rk-disabled-opacity)
    > .suffix
      pointer-events: none
.menu
  --menu-bg: #fff
  --menu-active-bg: #EBEFFF
  position: fixed
  overflow: hidden
  padding: 8px
  z-index: var(--z-menu)
  transition: height 10s
  line-height: 2.5
  font-size: 14px
  box-shadow: 0 0 2px var(--rk-border)
  border-radius: 10px
  background: var(--menu-bg)
  white-space: nowrap
  text-align: center
  > ul
    max-height: inherit
    overflow: auto
    scrollbar-width: none
    &::-webkit-scrollbar
      display: none
    &:not(:hover) > .selected
      background: var(--menu-active-bg)
    &:empty::before
      content: '--'
      text-align: center
      display: block
    > li
      cursor: pointer
      display: block
      padding: 0 20px
      border-radius: 8px
      &:hover
        background: var(--menu-active-bg)
      &.selected
        color: #406AFF
</style>
