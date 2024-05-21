<script setup lang="ts">
import { ref, watch, nextTick, provide } from 'vue'
import { useRoute } from 'vue-router'

let endingPid = -1
const endingTime = 200
const route = useRoute()

const loading = ref(0)
const ending = ref(false)
const init = ref(false)

watch(
  () => route.fullPath,
  () => {
    loading.value += 1
  },
  { immediate: true },
)

watch(
  loading,
  (ni, oi) => {
    clearTimeout(endingPid)

    if (ni > (oi || 0)) {
      reset()
    } else if (!ni) {
      ending.value = true
      endingPid = setTimeout(() => {
        ending.value = false
      }, endingTime)
    }
  },
  { immediate: true },
)

function reset() {
  init.value = true
  ending.value = false
  nextTick(() => {
    init.value = false
  })
}

provide('routeLoaded', () => {
  loading.value -= 1
})
</script>
<template lang="pug">
#progress-bar(:class="{loading,ending,init}")
slot
</template>
<style lang="sass">
#progress-bar
  position: fixed
  left: 0
  top: 0
  width: 0%
  height: 3px
  pointer-events: none
  z-index: var(--z-progress)
  background: linear-gradient(to left, #7190FE, #375EEB)
  background-size: 100vw
  &.loading
    width: 95%
    transition: width 10s cubic-bezier(0,1,0,1)
  &.ending
    width: 100%
    transition: none
  &.init
    width: 0%
    transition: none
</style>
