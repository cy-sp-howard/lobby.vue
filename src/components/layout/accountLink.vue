<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'
const userSotre = useUserStore()
const balance = computed(() => {
  return userSotre.Balance.toLocaleString('en', { minimumFractionDigits: 2 })
})
</script>
<template lang="pug">
.account-link
  span(@click="$router.push({name: 'Account'})") {{ userSotre.Currency }} {{ balance }}
  img(:src="userSotre.Avatar" @click="$router.push({name: 'Account'})")
  small.bell(:class="{active: userSotre.Notify}")
    svg-icon(icon="bell")
</template>
<style lang="sass" scoped>
.account-link
  display: grid
  grid-template-columns: auto 35px 30px
  grid-template-rows: 35px
  z-index: 2
  align-items: center
  justify-content: end
  gap: 20px
  padding: 20px 35px 0 0
  > *
    cursor: pointer
    &:hover
      transform: scale(1.05)
  > span
    color: #101010
    font-size: 16px
    font-weight: bold
  > img
    box-shadow: 0 0 0 2px #406AFF
    width: 100%
    height: 100%
    object-fit: cover
    border-radius: 50%
  > .bell
    color: #777
    font-size: 25px
    position: relative
    padding: 5px 0
    &.active::before
      content: ''
      position: absolute
      right: 0
      top: 0
      background: #406AFF
      width: 8px
      height: 8px
      border-radius: 50%
</style>
