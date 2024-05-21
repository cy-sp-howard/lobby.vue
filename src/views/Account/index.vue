<script setup lang="ts">
import { ref, inject, onMounted } from 'vue'
import Dialog from '@/utils/dialog'
import RecordFilter from './recordFilter.vue'
import Info from './info.vue'
import Tags from '@/components/layout/tags.vue'
import RkTableCol from '@/components/rkTable/rkTableCol.vue'
import RkTable from '@/components/rkTable/index.vue'
import useLang from '@/utils/useLang'

const { texts } = useLang('Account')
const routeLoaded = inject('routeLoaded', () => {})
const FilterApp = new Dialog(RecordFilter, { title: texts.value['篩選'] })
const tagOpts = [{ value: '全部' }, { value: 'Fish' }, { value: 'Other' }]
const activeType = ref('全部')

function getRowProps(i: { dt: boolean }) {
  return {
    class: { head: i.dt },
  }
}
function openFilterApp() {
  FilterApp.open()
}

onMounted(routeLoaded)
</script>

<template lang="pug">
#account
  h1 {{ texts.routeName }}
  info
  .record
    tags(v-model="activeType" :opts="tagOpts")
    svg-icon(icon="filter" @click="openFilterApp")
    .sum
      .total
        h6 {{texts['輸贏總計']}}:
        span 12,312
        h6 {{texts['統計時間']}}:
        span 6/5 23:00:00 - 6/6 22:59:59
      ul
        li.no1(:data-title="texts['電子']") 50.88
        li(:data-title="texts['電子']") 50.88
        li(:data-title="texts['電子']") 50.88
        li(:data-title="texts['電子']") 50.88
    rk-table(:data="[{a:123,dt:true,d:'3/21'},{a:12223,dt:false,d:'3/21'}]" :row-props="getRowProps")
      rk-table-col(title="" prop="d")
      rk-table-col(:title="texts['遊戲名稱']" prop="a")
      rk-table-col(:title="texts['供應商/類型']" prop="a")
      rk-table-col(:title="texts['投注額']" prop="a")
      rk-table-col(:title="texts['派彩']" prop="a")
      rk-table-col(:title="texts['輸贏']" prop="a")
      rk-table-col(:title="texts['注單號']" prop="a")
      rk-table-col(:title="texts['狀態']" prop="a")
</template>
<style lang="sass" scoped>
#account
  > h1
    color: #000
    font-size: 20px
    padding: 60px 50px 25px 50px
    font-weight: normal
    display: grid
    justify-content: center
    grid-template-columns: minmax(auto,3000px)
  > .record
    padding: 60px 50px
    display: grid
    grid-template: 'tags' 'sum' / minmax(auto, 3000px)
    justify-content: center
    > .tags,> .icon-filter
      grid-area: tags
    > .icon-filter
      justify-self: end
      align-self: end
      cursor: pointer
      &:hover
        transform: scale(1.1)
    > .sum
      padding: 50px 0 30px
      grid-area: sum
      display: grid
      grid-template-columns: auto auto
      align-items: end
      > .total
        display: grid
        grid-template-columns: auto auto
        align-content: start
        gap: 0 5px
        > *
          font-weight: normal
          color: #757575
          font-size: 12px
          &:first-of-type
            font-size: 16px
            color: #414141
            &:not(h6)
              color: #0ECB81
        > h6
          justify-self: end
      > ul
        display: grid
        grid-auto-flow: column
        grid-auto-columns: 150px
        text-align: center
        justify-self: end
        box-shadow: 0px 0px 4px #0000000D
        border: 1px solid #F3F3F3
        line-height: 30px
        border-radius: 5px
        > li
          font-weight: bold
          color: #0ECB81
          display: grid
          grid-template-columns: auto auto
          justify-content: center
          gap: 5px
          &:before
            color: #414141
            content: attr(data-title)
            font-weight: normal
          &:not(:last-of-type)
            border-right: inherit
          &.no1::after
            content: ''
            grid-area: 1 / 1 / span 1 / span 2
            background: url(/src/assets/img/no1.png) no-repeat center center
            background-size: contain
            justify-self: center
            transform: translateY(-100%)
            width: 25px
            height: 20px
            position: absolute
    :deep(> .rk-table)
      .rk-table-row
        &:nth-of-type(even)
          background: unset
        &.head
          background: #F6F8FF
          > td:first-of-type
            color: inherit !important
        > .rk-table-col
          border: 0
          &:first-of-type
            color: transparent


@container main (width <= 800px)
  #account
    > h1
      padding-top: 0

@container main (width <= 950px)
  #account > .record > .sum
    grid-template-columns: auto
    gap: 20px
    > .total
      justify-self: start
@container main (width <= 800px)
  #account > .record
    grid-template: 'filter' 'tags' 'sum'
    padding: 30px 25px
    white-space: nowrap
    > svg
      grid-area: filter !important
      margin-bottom: 20px
    > .sum > ul
      border: 0
      box-shadow: none
      gap: 10px
      justify-self: unset
      grid-auto-flow: row
      grid-template-columns: repeat(auto-fill, minmax(150px,1fr))
      > li
        box-shadow: 0px 0px 4px #0000000D
        border: 1px solid #F3F3F3
        border-radius: 5px
    :deep(> .rk-table)
      td:first-of-type
        color: inherit !important
</style>
