<script setup lang="ts">
import { useWebStore } from '@/stores/web'
import { ref, watch } from 'vue'

const webStore = useWebStore()
const show = ref(false)

watch(
  () => webStore.scrollPos.y,
  ni => {
    show.value = ni > 0
  },
  { immediate: true },
)

function move(val = 10) {
  if (document.documentElement.scrollTop <= 0) return
  val *= 2
  document.documentElement.scrollTop -= val
  setTimeout(move, 10, val)
}
</script>
<template lang="pug">
transition(name="fade")
  button#to-top(v-if="show" @click="move()")
</template>
<style lang="sass" scoped>
#to-top
  background: url(@img/top.png) no-repeat right
  background-size: contain
  width: 60px
  height: 60px
  position: fixed
  right: 0
  top: 75%
  &:hover
    filter: brightness(1.05)
</style>
