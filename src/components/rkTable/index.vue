<script lang="ts" setup>
import type { Ref } from 'vue'
import RkTableRow from './rkTableRow.vue'
type ANY = Ref['value']
defineOptions({
  name: 'RkTable',
})
const props = withDefaults(
  defineProps<{
    data: Record<string, unknown>[]
    loading?: boolean | number
    rowProps?: (row?: ANY) => ANY
  }>(),
  {
    loading: false,
    rowProps: () => ({}),
  },
)
</script>
<template lang="pug">
table.rk-table(:class="{loading}")
  transition(name="fade")
    caption(v-if="loading")
      svg-icon(icon="loading")
  thead
    rk-table-row
      slot
  tbody
    rk-table-row(v-for="(i,index) in props.data" :key="index" v-bind="rowProps(i)" :row-data="i")
      slot
</template>
<style lang="sass" scoped>
.rk-table
  font-size: 14px
  border-spacing: 0
  width: 100%
  position: relative
  &.loading
    cursor: progress
    > *
      pointer-events: none
      &:not(caption)
        opacity: 0.8
  > caption
    position: absolute
    top: 0
    left: 0
    width: 100%
    height: 100%
    font-size: 30px
    display: flex
    align-items: center
    justify-content: center
    z-index: 1
    background: var(--rk-bg)
    opacity: 0.7
    > svg
      animation: rotate 1s linear infinite


  > tbody
    position: relative
    &:empty
      height: 100px
      &::before
        content: attr(data-empty-text)
        opacity: 0.6
        font-size: 16px
        line-height: 100px
        position: absolute
        width: 100%
        text-align: center

@container (width < 600px)
  table
    > thead
      display: none !important
    > tbody
      display: grid
      gap: 20px
      :deep(> tr)
        display: grid
        > .rk-table-col
          display: grid
          grid-template-columns: 1fr 1fr
          height: 30px
          gap: 20px
          align-items: center
          text-align: left
          &::before
            content: attr(data-title)
            text-align: right
</style>
