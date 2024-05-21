<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import useLang from '@/utils/useLang'
import _ from 'lodash'

const props = withDefaults(defineProps<{ modelValue: number; size?: number; total: number }>(), {
  size: 20,
})
const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'change'): void
  (e: 'update:size', value: number): void
}>()
const { texts } = useLang()

const pageBtnMax = 8
const tempSize = ref(props.size)

const totalPage = computed(() => {
  return Math.ceil(props.total / props.size)
})
const pageRender = computed(() => {
  const ary = _.chain(pageBtnMax)
    .times(i => {
      const page = props.modelValue + i - Math.floor(pageBtnMax / 2)
      return { page, text: page.toString() }
    })
    .compact()
    .reject(i => i.page <= 0 || i.page > totalPage.value)
    .value()
  if (ary[0] && ary[0].page !== 1) {
    ary[0].text = '...'
    ary.unshift({ text: '1', page: 1 })
  }
  if (_.last(ary) && ary[ary.length - 1].page !== totalPage.value) {
    ary[ary.length - 1].text = '...'
    ary.push({ text: totalPage.value.toString(), page: totalPage.value })
  }
  return ary
})

watch(
  () => props.size,
  ni => (tempSize.value = ni),
)

function changePage(i: number) {
  if (i <= 0 || i > totalPage.value) return
  emit('update:modelValue', i)
  emit('change')
}
function changeSize() {
  emit('update:size', (tempSize.value = Math.abs(tempSize.value) || props.size))
  if (props.size === tempSize.value) return
  emit('update:modelValue', 1)
  emit('change')
}
</script>
<template lang="pug">
.rk-page(:class="{'one-page': pageRender.length < 2,hidden:!total}")
  span.prev(:class="{disabled:modelValue <= 1}" @click='changePage(modelValue - 1)')
    svg-icon(icon="down")
  .page-blocks
    span(
      v-for='(i,index) in pageRender',
      :key='index',
      :class='{ active: i.page === modelValue }',
      @click='changePage(i.page)'
    ) {{ i.text }}
  span.next(:class="{disabled:modelValue >= totalPage}" @click='changePage(modelValue + 1)')
    svg-icon(icon="down")
  rk-input(v-model="tempSize" maxlength="2" @change="changeSize")
    template(#suffix)
      span {{texts.itemUnit}} /{{texts.pageUnit}}
</template>

<style lang="sass" scoped>
.rk-page
  --border-color: #697388
  display: grid
  $h: 20px
  justify-content: center
  grid-auto-flow: column
  gap: 0 15px
  margin-top: 30px
  line-height: 25px
  font-size: 14px
  &.hidden
    visibility: hidden
  &.one-page > *:not(.rk-input)
    display: none
  > span
    width: 25px
    height: 25px
    display: flex
    align-items: center
    justify-content: center
    cursor: pointer
    color: var(--rk-border)
    border: 1px solid var(--rk-border)
    border-radius: 4px
    &:nth-of-type(1) > svg
      transform: rotate(90deg)
    &:nth-of-type(2) > svg
      transform: rotate(-90deg)
    &:hover:not(.disabled)
      border-color: LightSkyBlue
      color: LightSkyBlue
    &.disabled
      cursor: not-allowed
      opacity: 0.4
  > .page-blocks
    font-size: 16px
    display: grid
    grid-auto-flow: column
    justify-content: center
    gap: 0 10px
    > span
      cursor: pointer
      &:hover
        color: LightSkyBlue
    > .active
      color: LightSkyBlue
      pointer-events: none
  > :deep(.rk-input)
    --rk-form-item-height: 25px
    > input
      padding-left: 10px
      width: 100px
      text-align: center
    > span
      opacity: 0.6
      padding-right: 10px
</style>
