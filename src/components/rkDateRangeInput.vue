<script lang="ts" setup>
import { computed, provide, reactive, ref } from 'vue'
import type { Dayjs as Moment } from 'dayjs'
import moment from 'dayjs'
import _ from 'lodash'
type DateValue = string | number | Date | Moment | undefined

const props = defineProps<{
  label?: string
  start?: string | number
  end?: string | number
  initValue?: [unknown, unknown]
  valueFormat?: string
  disabled?: boolean | boolean[]
  displayFormat?: string
  max?: DateValue
  min?: DateValue
  clearable?: boolean
}>()
const emit = defineEmits<{
  (e: 'update:start', value?: unknown): void
  (e: 'update:end', value?: unknown): void
}>()

const pickerDayValues = reactive({ start: NaN, end: NaN })
const selecting = ref(0)

const momentProps = computed(() => {
  return {
    start: moment(props.start, props.valueFormat),
    end: moment(props.end, props.valueFormat),
  }
})
const fixedProps = computed(() => {
  const s_isEmpty = isEmpty(props.start)
  const e_isEmpty = isEmpty(props.end)
  const { start, end } = momentProps.value
  if (
    !s_isEmpty &&
    !e_isEmpty &&
    start.isValid() &&
    end.isValid() &&
    start.valueOf() > end.valueOf()
  ) {
    return { start: props.end, end: props.start }
  }
  return _.pick(props, ['start', 'end'])
})
const _start = computed({
  get: () => fixedProps.value.start,
  set(val: unknown) {
    const start = moment(val as string, props.valueFormat).valueOf()
    if (start > momentProps.value.end.valueOf()) {
      emit('update:end', val)
      emit('update:start', props.end)
    } else {
      emit('update:start', val)
    }
  },
})
const _end = computed({
  get: () => fixedProps.value.end,
  set(val: unknown) {
    const end = moment(val as string, props.valueFormat).valueOf()
    const startValue = momentProps.value.start.valueOf()
    if (!_.isNaN(startValue) && end < startValue) {
      emit('update:start', val)
      emit('update:end', props.start)
    } else {
      emit('update:end', val)
    }
  },
})
const pickerClass = computed(() => {
  return { start: { empty: isEmpty(_start.value) }, end: { empty: isEmpty(_end.value) } }
})
const childrenProps = computed(() => {
  const omitKey = ['start', 'end', 'initValue', 'label']
  if (_.isArray(props.disabled)) {
    omitKey.push('disabled')
    const _p = _.omit(props, omitKey)
    return [
      _.assign({ disabled: props.disabled[0] }, _p),
      _.assign({ disabled: props.disabled[1] }, _p),
    ]
  }

  const _p = _.omit(props, omitKey)
  return [_p, _p]
})

function isEmpty(val: unknown) {
  return ([null, '', undefined] as unknown[]).includes(val)
}
function setSelecting(val: number) {
  selecting.value += val
  if (selecting.value < 0) {
    selecting.value = 0
  }
}

provide('siblingValues', pickerDayValues)
</script>
<template lang="pug">
.rk-date-range-input(:class="{selecting,disabled:disabled ===true}")
  .wrapper
    rk-date-input(v-model="_start" :class="pickerClass.start" v-bind="childrenProps[0]" :init-value="initValue && initValue[0]" @open="setSelecting(1)" @close="setSelecting(-1)" @pick="(e:number)=>(pickerDayValues.start = e)")
    rk-date-input(v-model="_end" :class="pickerClass.end" v-bind="childrenProps[1]" :init-value="initValue && initValue[1]" @open="setSelecting(1)" @close="setSelecting(-1)" @pick="(e:number)=>(pickerDayValues.end = e)")
  strong.label(v-if="label !== undefined || $slots.label") 
    slot(name="label") {{ label }}
</template>
<style lang="sass" scoped>
.rk-date-range-input
  --empty-hover-opacity: 0.2
  --rk-form-item-width: 340px
  display: grid
  grid-template-columns: auto 1fr
  line-height: var(--rk-form-item-height)
  &:hover,&.selecting
    > .label
      color: LightSkyBlue
    > .wrapper
      border-color: LightSkyBlue
  &.disabled > .wrapper
    cursor: not-allowed
    opacity: var(--rk-disabled-opacity)
  > .label
    grid-area: 1 / 1 / span 1 / span 1
    font-size: 14px
    padding-right: 10px
    text-align: right
  > .wrapper
    display: grid
    grid-template-columns: 1fr auto 1fr
    overflow: hidden
    grid-auto-flow: column
    border: 1px solid var(--rk-border)
    border-radius: 5px
    width: var(--rk-form-item-width)
    &::before
      content: ' - '
      padding: 0 5px
      align-self: center
      grid-column: 2 / span 1
    > :deep(.rk-date-input)
      --rk-form-item-width: 100%
      width: 100%
      &.selecting,&:hover
        > .rk-input > input
          color: LightSkyBlue
        &.empty > .rk-input > input
          box-shadow: inset 0 0 20px LightSkyBlue
          opacity: var(--empty-hover-opacity)
      &:nth-child(1)
        > .rk-input > input
          padding-right: 0
      > .rk-input

        > input
          border-width: 0
          padding: 0
          text-align: center
</style>
