<script setup lang="ts">
import useLang from '@/utils/useLang'
import { useWebStore } from '@/stores/web'
import TextSlot from '@/components/textSlot.vue'
import RkButton from '@/components/rkButton.vue'

const { langStore, texts } = useLang('Forbidden')
const webStore = useWebStore()
</script>
<template lang="pug">
#forbidden.full-layout
  section
    text-slot(:text="texts.blockHint")
      b {{ texts['联络客服'] }}
    h6 {{ texts['您的 IP'] }}
      b  123.456.78
    .btns 
      rk-button(v-for="(lang,k) in langStore.collection.Web.lang" :key="k" :color="webStore.lang !== k?'hollow':'normal'" @click="webStore.lang = (k as string)") {{ lang }}
</template>
<style lang="sass" scoped>
#forbidden
  // background: url(@img/error/bg_area-limit.jpg) no-repeat top center
  background-size: 1920px
  z-index: 1
  display: grid
  grid-template-columns: 605px 605px
  gap: 85px
  align-content: center
  justify-content: center
  min-height: 620px
  padding-top: 155px
  &::before
    content: ''
    // background: url(@img/error/img_area-limit.png) no-repeat center right
    background-size: contain
    height: 620px
  > section
    // background: url(@img/logo.png) no-repeat left top
    background-size: 115px
    display: grid
    align-content: start
    padding: 80px 0
    margin-top: 125px
    > pre
      font-size: 16px
      color: #000
      padding-bottom: 10px
      :deep(> b)
        cursor: pointer
        text-decoration: underline
        color: #AC0E2A
        padding-left: 5px
    > h6
      font-size: 18px
      padding-bottom: 10px
      color: #000
      line-height: 33px
      display: grid
      grid-auto-flow: column
      justify-content: start
      > b
        background: #fff
        border: 1px solid #DADADA
        border-radius: 5px
        padding: 0 15px
        margin-left: 20px
    > .btns
      display: grid
      grid-auto-flow: column
      grid-auto-columns: 1fr
      width: fit-content
      justify-content: start
      gap: 15px
      :deep(> .rk-button )
        line-height: 33px
        height: 33px
        width: 108px
        > span
          border-radius: 5px

@media (width >= 1920px)
  #forbidden
    background-size: cover
</style>
