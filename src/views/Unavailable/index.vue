<script setup lang="ts">
import useLang from '@/utils/useLang'
import { useWebStore } from '@/stores/web'
import TextSlot from '@/components/textSlot.vue'
import RkButton from '@/components/rkButton.vue'

const { langStore, texts } = useLang('Unavailable')
const webStore = useWebStore()
</script>
<template lang="pug">
#unavailable.full-layout
  section
    h5 {{ texts['系统维护时间'] }}
    h6 {{ '2023/03/03 09:00-11:00' }}
    .btns 
      rk-button(v-for="(lang,k) in langStore.collection.Web.lang" :key="k" :color="webStore.lang !== k?'hollow':'normal'" @click="webStore.lang = (k as string)") {{ lang }}
    text-slot(:text="texts.blockHint")
      b {{ texts['联络客服'] }}
</template>
<style lang="sass" scoped>
#unavailable
  // background: url(@img/error/bg_maintain.jpg) no-repeat top center
  background-size: 1920px
  z-index: 1
  display: grid
  grid-template-columns: 650px 650px
  justify-content: center
  align-items: center
  min-height: 620px
  &::before
    content: ''
    // background: url(@img/error/img_maintain.png) no-repeat center center
    background-size: contain
    height: 620px
  > section
    // background: url(@img/logo.png) no-repeat top center
    background-size: 115px
    display: grid
    justify-items: center
    align-content: start
    padding: 100px 0
    > h5
      font-size: 18px
      color: #000
      margin-bottom: 15px
    > h6
      font-size: 18px
      color: #000
      line-height: 33px
      background: #fff
      border: 1px solid #DADADA
      border-radius: 5px
      padding: 0 30px
      margin-bottom: 30px
    > .btns
      display: grid
      grid-auto-flow: column
      grid-auto-columns: 1fr
      gap: 15px
      :deep(> .rk-button )
        line-height: 33px
        height: 33px
        width: 108px
        > span
          border-radius: 5px
    > pre
      font-size: 16px
      color: #000
      padding-top: 65px
      :deep(> b)
        cursor: pointer
        text-decoration: underline
        color: #AC0E2A

@media (width >= 1920px)
  #unavailable
    background-size: cover
</style>
