<script lang="ts" setup>
import { computed, inject, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import useAnchorObserver from '@/utils/useAnchorObserver'
import { useLangStore } from '@/stores/lang'
import { useWebStore } from '@/stores/web'
import type { Dayjs as Moment } from 'dayjs'
import moment from 'dayjs'
import _ from 'lodash'

type DateValue = string | number | Date | Moment | undefined
const props = defineProps<{
  modelValue?: DateValue
  initValue?: DateValue
  valueFormat?: string
  displayFormat?: string
  max?: DateValue
  min?: DateValue
  clearable?: boolean
  disabled?: boolean | number
  label?: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value?: string | number): void
  (e: 'open'): void
  (e: 'close'): void
  (e: 'pick', value: number): void
}>()
const { triggerAnchor } = useAnchorObserver(
  getAnchorTarget,
  setPickerSize,
  () => pickerShow.value,
  closePicker,
)
const siblingValues: { start: number; end: number } = inject('siblingValues') || {
  start: NaN,
  end: NaN,
}
const webStore = useWebStore()
const langStore = useLangStore()
const defaultStyle = {
  top: 'unset',
  left: 'unset',
  bottom: 'unset',
  right: 'unset',
}
let abortCtrl = new AbortController()
let preventClose = false

const input = ref<{ input: HTMLElement } | null>(null)
const el = ref<HTMLElement | null>(null)
const picker = ref<HTMLElement | null>(null)
const pickerShow = ref(false)
const jumping = ref(0)
const pickerDay = ref<number>(0)
const pickerTime = ref<number>(0)
const pickerMonth = ref(0)
const pickerStyle = reactive(_.clone(defaultStyle))

const _modelValue = computed(() => {
  const val = props.modelValue
  return isEmpty(val) ? undefined : moment(val, props.valueFormat)
})
const _displayFormat = computed(() => {
  const formatString = props.displayFormat || 'YYYY/MM/DD HH:mm:ss'
  const filteredFormat = formatString.replace(/\[[^\][]*\]/g, '')
  const year = filteredFormat.includes('Y')
  const month = filteredFormat.includes('M')
  const day = filteredFormat.includes('D')
  const hour =
    filteredFormat.includes('H') || filteredFormat.includes('h') || filteredFormat.includes('k')
  const minute = filteredFormat.includes('m')
  const second = filteredFormat.includes('s')
  return {
    formatString,
    year: year || month || day || hour || minute || second,
    month: month || day || hour || minute || second,
    day: day || hour || minute || second,
    hour: hour || minute || second,
    minute: minute || second,
    second,
  }
})
const displayValue = computed(() => {
  const m = _modelValue.value
  return m ? m.format(_displayFormat.value.formatString) : ''
})
const _initValue = computed(() => {
  if (_modelValue.value) {
    return _modelValue.value.clone()
  }
  const m = moment(props.initValue, props.valueFormat)
  if (_.isUndefined(props.initValue) && m.isValid()) {
    return m
  }
  const now = moment()
  const max = _max.value
  const min = _min.value
  if (min.diff(now) > 0) {
    return min.clone()
  } else if (max.diff(now) < 0) {
    return max.clone()
  }
  return now
})
const _max = computed(() => {
  const m = moment(props.max, props.valueFormat)
  if (_.isUndefined(props.max) || !m.isValid()) {
    return moment().add(100, 'y')
  }
  return m
})
const _min = computed(() => {
  const m = moment(props.min, props.valueFormat)
  if (_.isUndefined(props.min) || !m.isValid()) {
    return moment().add(-100, 'y')
  }
  return m
})
const texts = computed(() => {
  return langStore.texts.Web
})
const dayNames = computed(() => {
  const _texts = texts.value
  const ary = ['日', '一', '二', '三', '四', '五', '六']
  return {
    full: _.map(ary, i => _texts['周' + i]),
    less: _.map(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], i => _texts[i]),
  }
})
const pickerValueStrAry = computed(() => {
  const m = pickerValue.value
  let formatStr = 'YYYY'
  const formatShow = _displayFormat.value
  if (formatShow.month) {
    formatStr += ',MM'
  }
  if (formatShow.day) {
    formatStr += ',DD'
  }
  if (formatShow.hour) {
    formatStr += ',HH'
  }
  if (formatShow.minute) {
    formatStr += ', : mm'
  }
  if (formatShow.second) {
    formatStr += ', : ss'
  }
  const ary = m.format(formatStr).split(',')
  if (ary.length >= 3) {
    ary.splice(3, 0, dayNames.value.full[m.day()])
  }
  return ary
})
const timeRender = computed(() => {
  const val = pickerValue.value
  const minHour = _min.value.clone().startOf('h')
  const maxHour = _max.value.clone().endOf('h')
  const hours = _.times(24, i => {
    const m = val.clone().set('h', i)
    const value = m.valueOf() - pickerDay.value
    return {
      active: value === pickerTime.value,
      value,
      label: m.format('HH'),
      disabled: m < minHour || m > maxHour,
    }
  })
  const minMin = _min.value.clone().startOf('m')
  const maxMin = _max.value.clone().endOf('m')
  const minutes = _.times(60, i => {
    const m = val.clone().set('m', i)
    const value = m.valueOf() - pickerDay.value
    return {
      active: value === pickerTime.value,
      value,
      label: m.format('mm'),
      disabled: m < minMin || m > maxMin,
    }
  })
  const minSec = _min.value.clone().startOf('s')
  const maxSec = _max.value.clone().endOf('s')
  const seconds = _.times(60, i => {
    const m = val.clone().set('s', i)
    const value = m.valueOf() - pickerDay.value
    return {
      active: value === pickerTime.value,
      value,
      label: m.format('ss'),
      disabled: m < minSec || m > maxSec,
    }
  })
  const ary = []
  if (_displayFormat.value.hour) ary.push(hours)
  if (_displayFormat.value.minute) ary.push(minutes)
  if (_displayFormat.value.second) ary.push(seconds)
  return ary
})
const monthRender = computed(() => {
  const val = moment(pickerMonth.value)
  const minMonth = _min.value.clone().startOf('M')
  const maxMonth = _max.value.clone().endOf('M')
  return _.times(12, i => {
    const value = val.clone().set('M', i).startOf('M')
    return {
      selectActive: pickerValue.value.format('YYYY,MM') === value.format('YYYY,MM'),
      label: value.format('MM'),
      disabled: value < minMonth || value > maxMonth,
    }
  })
})
const yearRender = computed(() => {
  const min = _min.value.year()
  const max = _max.value.year()
  const value = moment(pickerDay.value)
  const month = moment(pickerMonth.value)
  return _.chain(300)
    .times(i => {
      const year = min + i
      return {
        year,
        isValueYear: value.year() === year,
        isMonthYear: month.year() === year,
      }
    })
    .reject(i => {
      return i.year < min || i.year > max
    })
    .value()
})
const pickerRender = computed(() => {
  const month = moment(pickerMonth.value)
  const min = _min.value.clone().startOf('d').valueOf()
  const max = _max.value.clone().startOf('d').valueOf()

  const monthNum = month.month()
  const firstDay = month.clone().startOf('M').startOf('w')
  return {
    title: `${month.year()} ${texts.value['年']} ${monthNum + 1} ${texts.value['月']}`,
    days: _.chain(42)
      .times<{
        value?: number
        disabled?: boolean | number
        classList?: Record<string, boolean>
        text: number | string
      }>(i => {
        const day = firstDay.clone().add(i, 'd')
        const value = day.valueOf()

        const isLock = value > max || value < min
        const isSameMonth = day.month() === monthNum

        const disabled = !isSameMonth || isLock
        const active = moment(pickerDay.value).startOf('d').valueOf() === value
        const hidden =
          day.clone().startOf('w').month() !== monthNum &&
          day.clone().endOf('w').month() !== monthNum

        const { start, end } = siblingValues
        const _start = start > end ? end : start
        const _end = _start === start ? end : start
        const rangeStart = _start === value
        const rangeEnd = _end === value
        const inRange = _start <= value && _end >= value

        const classList = {
          disabled,
          active,
          hidden,
          'in-range': inRange,
          'range-start': rangeStart,
          'range-end': rangeEnd,
        }
        return {
          value,
          disabled,
          classList,
          text: day.date(),
        }
      })
      .unshift(
        ..._.map(dayNames.value.less, i => ({
          text: i,
          disabled: true,
          classList: { disabled: true },
        })),
      )
      .value(),
  }
})
const pickerValue = computed(() => moment(pickerDay.value + pickerTime.value))
const outOfRange = computed(() => pickerValue.value > _max.value || pickerValue.value < _min.value)
const showSubmit = computed(() => {
  const _s = _displayFormat.value
  return !_s.month || (!_s.day && jumping.value !== 1) || !jumping.value
})

watch(() => props.modelValue, resetPicker, { immediate: true })
watch(
  [() => props.min, () => props.max],
  () => {
    if (_min.value > pickerValue.value) {
      updateValue(_min.value)
    } else if (_max.value < pickerValue.value) {
      updateValue(_max.value)
    }
  },
  { immediate: true },
)
watch(
  jumping,
  ni => {
    if (!_displayFormat.value.month && ni !== 1) {
      jumping.value = 1
    } else if (!_displayFormat.value.day && [0, 2].includes(ni)) {
      jumping.value = 3
    }
  },
  { immediate: true },
)

function setYear(value: number) {
  const _m = moment(pickerMonth.value).set('y', value)
  pickerMonth.value = _m.valueOf()
  const formatShow = _displayFormat.value
  if (!formatShow.month) {
    setDay(_m.startOf('y').valueOf())
    setTime(0)
  }
}
function setMonth(value: number) {
  const _m = moment(pickerMonth.value).set('M', value)
  pickerMonth.value = _m.valueOf()
  const formatShow = _displayFormat.value
  if (!formatShow.day) {
    setDay(_m.startOf('m').valueOf())
    setTime(0)
  }
}
function setTime(value: number) {
  pickerTime.value = value
}
function openYearJumper() {
  if (jumping.value === 1) return (jumping.value = 0)
  jumping.value = 1
}
function openTimeJumper() {
  if (jumping.value === 2) return (jumping.value = 0)
  jumping.value = 2
}
function openMonthJumper() {
  if (jumping.value === 3) return (jumping.value = 0)
  jumping.value = 3
}
function setValue(isClear?: boolean) {
  if (isClear) {
    emit('update:modelValue', undefined)
  } else {
    if (outOfRange.value) return
    updateValue(pickerValue.value)
    closePicker()
  }
}
function updateValue(val: Moment) {
  if (props.valueFormat) {
    emit('update:modelValue', val.format(props.valueFormat))
  } else {
    emit('update:modelValue', val.toJSON())
  }
}
function isEmpty(val: unknown) {
  return ([null, '', undefined] as unknown[]).includes(val)
}
function setDay(val: number) {
  pickerDay.value = val
  emit('pick', pickerDay.value)
}
function resetPicker() {
  const _s = _displayFormat.value
  const startUnit = !_s.month ? 'y' : !_s.day ? 'M' : 'd'
  setDay(_initValue.value.clone().startOf(startUnit).valueOf())
  const startTimeUnit = !_s.hour ? 'd' : !_s.minute ? 'h' : !_s.second ? 'm' : 's'
  pickerTime.value = _initValue.value.clone().startOf(startTimeUnit).valueOf() - pickerDay.value
  pickerMonth.value = _initValue.value.clone().startOf('M').valueOf()
}
function openPicker() {
  if (props.disabled) return
  else if (pickerShow.value) {
    return (preventClose = true)
  }
  resetPicker()
  pickerShow.value = true
  emit('open')
  preventClose = true
  jumping.value = 0

  abortCtrl = new AbortController()
  addEventListener('mousedown', closePicker, { signal: abortCtrl.signal })
  nextTick(triggerAnchor)
}
function closePicker() {
  if (preventClose) {
    return (preventClose = false)
  }
  pickerShow.value = false
  emit('close')
  abortCtrl.abort()
}
function scrollToView($refs: { times?: HTMLElement[]; years?: HTMLElement }) {
  if ($refs.times && !_.isEmpty($refs.times)) {
    _.each($refs.times, i => i.querySelector('.active')?.scrollIntoView({ block: 'center' }))
  } else if ($refs.years) {
    $refs.years.querySelector('.month-active')?.scrollIntoView({ block: 'center' })
  }
}
function nextMonth(val: number) {
  pickerMonth.value = moment(pickerMonth.value).add(val, 'M').valueOf()
}
function setPickerSize(rect: DOMRectReadOnly) {
  if (!picker.value) return
  const margin = 10
  const marginPx = margin + 'px'
  const { offsetHeight } = picker.value
  const { vw, vh } = webStore.size
  _.assign(pickerStyle, defaultStyle)
  const { left, right, top, bottom } = rect
  const rightRange = vw - right
  if (rightRange > left) {
    pickerStyle.left = (left < 0 ? margin : left) + 'px'
  } else {
    pickerStyle.right = (rightRange < 0 ? margin : rightRange) + 'px'
  }
  const bottomRange = vh - top
  if (bottomRange > top) {
    const val = bottom + margin
    if (val + offsetHeight > vh) {
      pickerStyle.bottom = marginPx
    } else {
      pickerStyle.top = val + 'px'
    }
  } else {
    const val = bottomRange + margin
    if (val + offsetHeight > vh) {
      pickerStyle.top = marginPx
    } else {
      pickerStyle.bottom = val + 'px'
    }
  }
}
function getAnchorTarget() {
  return input.value?.input || el.value
}
function wheelHandler(evt: WheelEvent) {
  nextMonth(evt.deltaY > 0 ? 1 : -1)
}

onBeforeUnmount(closePicker)
</script>

<template lang="pug">
.rk-date-input(ref="el" :class="{disabled,selecting:pickerShow}")
  slot(:display-value="displayValue" :open-picker="openPicker")
    rk-input(ref="input" disabled :model-value='displayValue' :label="label" @mousedown='openPicker')
      template(v-if="$slots.label" #label="{label:inputLabel}")
        slot(name="label" :label="inputLabel")
  teleport(v-if="pickerShow" to="body")
    .date-picker(ref="picker" :style="pickerStyle" @mousedown="preventClose = true")
      header
        small(v-if="pickerValueStrAry[4]" @click="openTimeJumper") {{ pickerValueStrAry[4] }}{{ pickerValueStrAry[5] }}{{ pickerValueStrAry[6] }}
        b(@click='openYearJumper') {{ pickerValueStrAry[0] }}{{texts["年"]}}
        span(@click='openMonthJumper') 
          template(v-if="pickerValueStrAry[1]") {{ pickerValueStrAry[1] }}{{texts["月"]}}
          template(v-if="pickerValueStrAry[2]") {{ pickerValueStrAry[2] }}{{ texts["日"] }} 
          | {{pickerValueStrAry[3]}}
      div
        transition(name="fade" @enter="scrollToView($refs)")
          .year-picker(v-if='jumping === 1')
            ol(ref="years")
              li(
                v-for='i in yearRender',
                :key='i.year',
                :class='{ active: i.isValueYear, "month-active": i.isMonthYear }',
                @click='setYear(i.year);i.isMonthYear &&(jumping = 0)'
                @transitionend="jumping = 0"
              ) {{ i.year }}
            rk-scroll(:get-target="()=>$refs.years")
          .time-picker(v-else-if="jumping === 2")
            div(v-for="(list,refIndex) in timeRender" :key="refIndex")
              ol(ref="times")
                li(
                  v-for='(i,index) in list',
                  :key='index',
                  :class='{ active: i.active,disabled:i.disabled}',
                  @click='i.disabled || setTime(i.value)'
                  @transitionend="jumping = 0"
                ) {{ i.label }}
              rk-scroll(:get-target="()=>($refs.times as HTMLElement[])[refIndex]")
          .month-picker(v-else-if='jumping === 3')
            ol(ref="months")
              li(
                v-for='(i,index) in monthRender',
                :key='index',
                :class='{ active: i.selectActive,disabled: i.disabled}',
                @click='setMonth(index);i.selectActive &&(jumping = 0)'
                @transitionend="jumping = 0"
              ) {{ i.label }}
        .arrow
          span(@click='nextMonth(-1)')
            svg-icon(icon='down')
          strong {{ pickerRender.title }}
          span(@click='nextMonth(1)')
            svg-icon(icon='down')
        ul.calendar(@wheel="wheelHandler")
          li(
            v-for='(day, index) in pickerRender.days',
            :key='index',
            :class='day.classList',
            :data-text="day.text"
            @click='day.disabled || setDay(day.value || 0)'
          ) 
      span(:class="{hidden:!showSubmit}")
        b(v-if="clearable" :class='{ disabled: modelValue === undefined }', @click='setValue(true);closePicker()') {{texts["清除"]}}
        b(@click='closePicker') {{texts["取消"]}}
        b(:class="{disabled: outOfRange}" @click='setValue()') {{texts["选择"]}}
</template>
<style lang="sass" scoped>
.rk-date-input
  &.selecting > :deep(.rk-input)
    > input
      border-color: LightSkyBlue
    > .label
      color: LightSkyBlue
  &:not(.disabled) > :deep(.rk-input)
    cursor: pointer
    > input
      pointer-events: none
      opacity: 1
.date-picker
  --picker-body-bg: #262a33
  --picker-footer-bg: transparent
  --range-bg: #fff1
  position: fixed
  z-index: var(--z-menu)
  border: 1px solid LightSkyBlue
  background: var(--rk-bg)
  border-radius: 10px
  overflow: hidden
  user-select: none
  > header
    display: grid
    padding: 10px 0
    padding-left: 0
    padding-right: 0
    gap: 0 10px
    background: LightSkyBlue
    grid-template-columns: 3fr 4fr
    grid-template-rows: auto auto
    color: white
    > b
      font-size: 20px
      font-weight: bold
      letter-spacing: 2px
      text-align: center
      cursor: pointer
      grid-area: 1 / 1 / span 1 / span 2
      &:hover
        text-shadow: 0 0 3px blue
    > span
      font-size: 16px
      align-self: flex-end
      grid-area: 2 / 1 / span 1 / span 2
      &:last-child
        text-align: center
    > small
      grid-template-columns: repeat(3,25px)
      font-size: 16px
      line-height: 30px
      justify-self: center
      cursor: pointer
      grid-area: 2 / 1 / span 1 / span 2
      &:hover
        text-shadow: 0 0 3px blue
      ~ span
        grid-area: 1 / 2 / span 1 / span 1
        text-align: left !important
      ~ b
        justify-self: flex-end
        grid-area: 1 / 1 / span 1 / span 1


  > div
    background: var(--picker-body-bg)
    position: relative
    padding: 10px 20px 0 20px
    > .year-picker, > .time-picker, > .month-picker
      position: absolute
      width: 100%
      height: 100%
      left: 0
      top: 0
      background: inherit
      z-index: 1
      li
        transition: font-size 0.2s ,color 0.2s
        cursor: pointer
        position: relative
        &.disabled
          pointer-events: none
          opacity: 0.4
        &.active
          color: LightSkyBlue
          font-weight: bold
        &:hover::before
          position: absolute
          content: ''
          top: 50%
          left: 50%
          transform: translate(-50%,-50%)
          width: 40px
          height: 40px
          border-radius: 50%
          border: 1px solid LightSkyBlue
    > .year-picker, > .month-picker
      padding: 10px 20px 0 20px
      li:hover::before
        border-radius: 5px
        width: 60px
      > ol
        font-size: 16px
        text-align: center
        height: 100%
        line-height: 45px
        overflow: auto
        display: grid
        align-content: start
        grid-template-columns: repeat(4,1fr)
        > li.month-active
          font-size: 20px
          font-weight: bold
      > .rk-scroll
        transform: translateX(-5px)
    > .time-picker
      display: grid
      padding: 10px 5px 0 5px
      grid-auto-columns: 1fr
      grid-auto-flow: column
      > div
        height: 100%
        overflow: hidden
        position: relative
        > ol
          overflow: auto
          font-size: 16px
          text-align: center
          height: 100%
          line-height: 45px

    > .arrow
      font-size: 20px
      line-height: 30px
      width: 100%
      display: flex
      justify-content: space-between
      text-align: center
      > strong
        font-size: 16px
        display: block
        font-weight: normal
      > span
        cursor: pointer
        border-radius: 5px
        flex: 0 0 30px
        display: flex
        justify-content: center
        align-items: center
        &:hover
          box-shadow: 0 0 0 1px LightSkyBlue
        &:nth-of-type(1) > svg
          transform: rotate(90deg)
        &:nth-of-type(2) > svg
          transform: rotate(-90deg)

    > .calendar
      display: grid
      $w: 35px
      gap: 5px 0
      grid-template-columns: repeat(7, $w)
      grid-template-rows: repeat(6, $w)
      > li
        text-align: center
        font-size: 16px
        line-height: $w
        cursor: pointer
        &::before
          content: attr(data-text)
          display: block
          border-radius: 50%
        &:nth-of-type(7n)
          border-radius: 0 50% 50% 0
          &.range-start
            border-radius: 50% !important
        &:nth-of-type(7n+1)
          border-radius: 50% 0 0 50%
          &.range-end
            border-radius: 50% !important
        &:nth-of-type(-n + 7)
          color: LightSkyBlue
          opacity: 1 !important
        &.disabled
          pointer-events: none
          opacity: 0.4
        &.active
          color: white
          &::before
            background: LightSkyBlue

        &.in-range
          background: var(--range-bg)
          &.range-start
            border-radius: 50% 0 0 50%
            &.range-end
              border-radius: 50%
          &.range-end
            border-radius: 0 50% 50% 0
          &.range-start,&.range-end
            &:not(.active)::before
              background: inherit
        &:hover::before
          box-shadow: 0 0 0 1px LightSkyBlue
        &.hidden
          visibility: hidden

  > span
    background: var(--picker-footer-bg)
    display: grid
    grid-template-columns: auto 1fr auto
    font-size: 16px
    padding: 5px 20px 20px 20px
    gap: 10px
    &.hidden
      visibility: hidden
    > b
      opacity: 0.8
      cursor: pointer
      padding: 5px
      border-radius: 3px
      &:hover
        opacity: 1
        color: LightSkyBlue
        box-shadow: 0 0 0 1px currentColor
      &.disabled
        pointer-events: none
        opacity: 0.4
      &:nth-of-type(2)
        justify-self: flex-end
      &:last-of-type
        grid-column-end: -1
</style>
