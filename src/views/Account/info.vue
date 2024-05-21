<script setup lang="ts">
import { useLangStore } from '@/stores/lang'
import { useUserStore } from '@/stores/user'
import { useWebStore } from '@/stores/web'
import useLang from '@/utils/useLang'
const userStore = useUserStore()
const webStore = useWebStore()
const langStore = useLangStore()
const { texts } = useLang('Account')
</script>

<template lang="pug">
.account-info
  div
    .img-container
      img(:src="userStore.Avatar")
    i
    h5 what
  ul
    li(v-for="i in 3" :key="i")
      h6
        span {{texts['電子']}} {{texts['本週排行']}} 9
        strong {{texts['連續進榜']}}
      div
        span {{texts['投注數']}}
        i 124911765
      div
        span {{texts['勝場數']}}
        strong 124911765
      .rate
        span {{texts['勝率']}}
        b(:style="{'--rate': 80}")
        i 67%
  ol
    li(v-for="(i,k) in langStore.collection.Web.lang" :key="k" :class="{active:webStore.lang === k,[k]:true }" @click="webStore.lang = String(k)")
hr
</template>

<style lang="sass" scoped>
.account-info
  border-top: 1px solid #f2f2f2
  height: 215px
  display: grid
  justify-content: center
  align-content: center
  align-items: end
  grid-template-columns: 200px minmax(900px,1200px) 150px
  padding-top: 25px
  white-space: nowrap
  > div
    display: grid
    justify-content: end
    grid-template: 'a' 1fr 'b' / 115px
    gap: 5px
    > .img-container
      grid-area: a
      width: 90px
      height: 90px
      padding: 3px
      border-radius: 50%
      box-shadow: 0 0 20px #406AFF66
      justify-self: center
      background: linear-gradient(135deg, #406AFF 15%, #E2E8FF 30%, #406aff 50%, #d8e2ff 65%, #406AFF 85%)
      > img
        border-radius: 50%
        width: 100%
        height: 100%
        object-fit: cover
    > i
      grid-area: a
      background: url(@img/edit.png) no-repeat center center
      background-size: contain
      width: 20px
      height: 20px
      justify-self: end
      align-self: end
      cursor: pointer
      &:hover
        transform: scale(1.1)
    > h5
      grid-area: b
      justify-self: center
      color: #000
      font-size: 16px
      font-weight: normal
  > ul
    display: grid
    grid-template-columns: repeat(3, 1fr)
    > li
      line-height: 1
      display: grid
      grid-template-columns: 260px
      justify-content: center
      position: relative
      &::before
        content: ''
        position: absolute
        top: 0
        left: 0
        transform: translateY(-150%)
        width: 25px
        height: 20px
        grid-area: 1 / 1 / span 1 / span 1
        background: url(@img/no1.png) no-repeat center center
        background-size: contain
      &:nth-of-type(2)
        border: 1px solid #F0F0F0
        border-top: 0
        border-bottom: 0

      > h6
        font-size: 16px
        font-weight: normal
        display: grid
        grid-auto-flow: column
        justify-content: space-between
        padding-bottom: 15px
        > strong
          font-size: 14px
          color: #406AFF
          &::before
            content: '★ '
      > div
        display: grid
        grid-template-columns: 50px 1fr
        align-items: center
        padding: 3px 0
        > span
          font-size: 12px
        > strong
          color: #406AFF
          font-size: 20px
          font-weight: normal
          font-style: italic
      > .rate
        grid-template-columns: 50px 1fr auto
        padding-top: 15px
        > b
          height: 6px
          border-radius: 100px
          background: #F1F1F1
          &::before
            content: ''
            display: block
            height: 100%
            border-radius: 100px
            width: calc(var(--rate) * 1%)
            background: linear-gradient(90deg, #406AFF, #aabcff)
        > i
          padding-left: 10px
          color: #406AFF
  > ol
    grid-row-start: 3
    grid-column-start: -2
    justify-content: end
    display: grid
    grid-auto-flow: column
    gap: 10px
    padding: 5px 40px 0 0
    > li
      background: var(--icon) no-repeat center center
      background-size: cover
      border-radius: 50%
      border: 1px solid #fff
      width: 23px
      height: 23px
      cursor: pointer
      &.active
        box-shadow: 0 0 0 2px #406AFF
      &.en_US
        --icon: url(@img/en.png)
      &.zh_Hans
        --icon: url(@img/cn.png)
      &.pt_PT
        --icon: url(@img/pt.png)

hr
  margin: 0
  border: 1px solid #d2d2d2
  border-bottom: 0
  box-shadow: 0 0 20px #406AFF99

@container main (width < 1250px)
  .account-info
    grid-template: '.' '.' '.' / minmax(900px,1fr)
    height: auto
    padding-bottom: 25px
    gap: 10px
    > div
      justify-content: center
      padding-bottom: 30px

@container main (width < 900px)
  .account-info
    grid-template-columns: auto
    > ul
      grid-template-columns: 1fr
      > li
        padding: 10px 0
        &::before
          width: 100%
          position: relative
          transform: none
          margin-bottom: 10px
        &:nth-of-type(2)
          border: 1px solid #F0F0F0
          border-left: 0
          border-right: 0

    > ol
      justify-content: center
      padding-right: 0
</style>
<style lang="sass"></style>
