<script setup lang="ts">
import { ref, computed, onBeforeUnmount, onMounted, reactive, nextTick, watch, inject } from 'vue'
import { RouterLink } from 'vue-router'
import img1 from '@img/banner_d_1.png'
import img2 from '@img/banner_d_2.png'
import img3 from '@img/banner_d_3.png'
import _ from 'lodash'
import { useUserStore } from '@/stores/user'
import useLang from '@/utils/useLang'
let pid = -1

const gamesContainerWidth = inject('gamesContainerWidth', ref(0))
const count = ref(3)
const itemSize = reactive({
  width: 0,
  height: 0,
})
const wrapperRef = ref<null | HTMLElement>(null)
const wrapperOffset = ref(0)
const activeIndex = ref(0)
const moving = ref(0)
const disableTrans = ref(false)
const userStore = useUserStore()
const { texts } = useLang('Home')

const banners = computed(() => {
  const defaultImgs = [img1, img2, img3]
  const defaultBanners = _.chain(count.value / defaultImgs.length)
    .ceil()
    .times(() => defaultImgs)
    .flatten()
    .map((i, index) => ({
      ID: index * -1,
      Pic: i,
      Type: 4,
    }))
    .value()
  return _.chain(userStore.Banner || [])
    .concat(defaultBanners)
    .take(_.max([count.value + 1, (userStore.Banner || []).length]))
    .value()
})
const bannersRender = computed(() => {
  const len = banners.value.length
  const movingExtra = Math.abs(moving.value)
  const startIndex = moving.value < 0 ? (activeIndex.value - 1 + len) % len : activeIndex.value
  return _.chain(banners.value)
    .concat(_.map(banners.value, i => _.assign({}, i, { BannerID: i.ID + '-2nd' })))
    .drop(startIndex)
    .take(count.value + movingExtra)
    .map(i => {
      const item = {
        is: 'span',
        attrs: {
          style: {
            backgroundImage: `url('${i.Pic}')`,
            ..._.mapValues(itemSize, val => (movingExtra ? val + 'px' : 'unset')),
          },
        },
        id: i.ID,
      }
      switch (i.Type) {
        case 1:
          return _.merge(item, {
            is: RouterLink,
            attrs: {
              to: { name: 'EventDetail', params: { id: i.ID || 0 } },
            },
          })
      }
      return item
    })
    .value()
})

watch(gamesContainerWidth, setCount)

function setActive(moveDirection: number) {
  if (!moveDirection || moving.value) return
  const len = banners.value.length
  prepareMove(moveDirection % len).then(move => {
    move()
  })
}
function prepareMove(direction: number): Promise<Function> {
  clearTimeout(pid)
  if (!wrapperRef.value) return Promise.reject()
  const itemEle = wrapperRef.value.querySelector('.item')
  if (!(itemEle instanceof HTMLElement)) return Promise.reject()
  const { offsetHeight, offsetWidth } = itemEle
  itemSize.height = offsetHeight
  itemSize.width = offsetWidth

  moving.value = direction

  disableTrans.value = true
  const wrapperWidth = wrapperRef.value.offsetWidth
  return new Promise(rs => {
    nextTick(() => {
      const moveX = (wrapperRef.value?.offsetWidth || 0) - wrapperWidth

      if (moving.value < 0) {
        wrapperOffset.value = moveX * -1
      }
      rs(() => {
        setTimeout(() => {
          disableTrans.value = false
          if (wrapperOffset.value) {
            wrapperOffset.value = 0
          } else {
            wrapperOffset.value = moveX * -1
          }
        }, 0)
      })
    })
  })
}
function moveDone() {
  disableTrans.value = true
  const len = banners.value.length
  activeIndex.value += moving.value
  if (activeIndex.value >= len) {
    activeIndex.value = 0
  } else if (activeIndex.value < 0) {
    activeIndex.value = len - 1
  }
  moving.value = 0
  wrapperOffset.value = 0
  setTimeout(() => {
    disableTrans.value = false
    autoPlayNext()
    setCount()
  }, 0)
}
function autoPlayNext() {
  clearTimeout(pid)
  pid = setTimeout(setActive, 5000, 1)
}
function setCount() {
  const el = wrapperRef.value?.parentElement
  if (!el) return
  if (el.offsetWidth < 900) {
    count.value = 1
  } else if (el.offsetWidth < 1500) {
    count.value = 2
  } else {
    count.value = 3
  }
}

onMounted(() => {
  setCount()
  autoPlayNext()
})
onBeforeUnmount(() => {
  clearTimeout(pid)
})
</script>

<template lang="pug">
section.banner
  h1 {{ texts['正在举办'] }}
  .container
    div(ref="wrapperRef" :class="{'disable-trans':disableTrans}" @transitionend="moveDone")
      template(v-for="(i) in bannersRender" :key="i.id" )
        component.item(:is="i.is" v-bind="i.attrs" :data-k="i.id")
  button.left-btn(@click="setActive(-1)")
  button.right-btn(@click="setActive(1)")
</template>

<style lang="sass" scoped>
section.banner
  display: grid
  gap: 20px
  position: relative
  grid-template: '.' 'banner'
  align-content: start
  > h1
    color: #000
    font-size: 20px
    line-height: 1
  > .container
    grid-area: banner
    display: grid
    overflow: hidden
    grid-template-rows: auto
    grid-template-columns: 1fr
    padding: 3px
    > div
      width: 100%
      display: grid
      grid-auto-flow: column
      grid-auto-columns: 1fr
      --x: v-bind(wrapperOffset)
      transform: translateX(calc(var(--x) * 1px))
      gap: 15px
      &:not(.disable-trans)
        transition: transform .4s
      > span,> a
        background-color: #fff
        background-position: center
        background-repeat: no-repeat
        background-size: cover
        // box-shadow: 0 0 5px 0 rgba(21, 10, 0, 0.3)
        border-radius: 8px
        padding-bottom: 38%
  button
    grid-area: banner
    background: url(@img/left_arrow.png) no-repeat center center
    background-size: cover
    width: 35px
    height: 35px
    position: absolute
    top: 50%
    &.left-btn,&.left-btn:active
      left: 0
      transform: translate(-50%,-50%) !important
    &.right-btn,&.right-btn:active
      right: 0
      transform: translate(50%,-50%) !important
      background-image: url(@img/right_arrow.png)
</style>
