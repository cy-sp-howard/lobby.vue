<script setup lang="ts">
import Tags from '@/components/layout/tags.vue'
import RkSelect from '@/components/rkSelect.vue'
import RkButton from '@/components/rkButton.vue'
import { reactive, inject } from 'vue'

const close = inject<() => {}>('close') || (() => {})
const statusList = [
  { value: '全部' },
  { value: '已結算' },
  { value: '未結算' },
  { value: '提前結算' },
  { value: '拒絕' },
]
const dateList = [
  { value: '7日內' },
  { value: '今日' },
  { value: '昨日' },
  { value: '3日內' },
  { value: '15日內' },
  { value: '30日內' },
  { value: '本月' },
  { value: '上月' },
]
const typeList = [
  { value: '全部' },
  { value: '真人' },
  { value: '電子' },
  { value: '虛擬體育' },
  { value: '棋牌' },
  { value: '彩票' },
]

const postData = reactive({
  status: '全部',
  date: '7日內',
  type: '全部',
  game: '電子',
  platform: '昨日',
})
</script>

<template lang="pug">
form.record-filter
  div
    h6 狀態
    tags(v-model="postData.status" :opts="statusList")
  div
    h6 時間
    tags(v-model="postData.date" :opts="dateList")
  div
    h6 遊戲
    tags(v-model="postData.type" :opts="typeList")
  .half
    h6 類型
    rk-select(v-model="postData.game" :opts="typeList")
  .half
    h6 平台
    rk-select(v-model="postData.platform" :opts="dateList")
  .btns
    rk-button(color="cancel" @click="close") 取消
    rk-button 搜尋


</template>

<style lang="sass" scoped>
.record-filter
  padding: 0 20px 30px 20px
  width: 555px
  display: grid
  gap: 30px 10px!important
  grid-template-columns: auto auto
  > div
    --rk-form-item-width: 100%
    &:not(.half)
      grid-column-end: span 2
    > h6
      color: #757575
      font-size: 14px
      font-weight: normal
      line-height: 30px
    > .tags
      gap: 10px
  > .btns
    display: grid
    grid-template-columns: 150px 150px
    justify-content: end
    gap: 10px
    padding-top: 50px
    > .rk-button
      --rk-form-item-height: 45px
</style>
