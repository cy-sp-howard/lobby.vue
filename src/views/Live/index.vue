<script setup lang="ts">
import TypeLayout from '@/components/layout/typeLayout.vue'
import { GameType } from '@/api/Game'
</script>
<template lang="pug">
type-layout#live(:type="GameType.Live")
</template>
<style lang="sass" scoped>
#live
  :deep(.banner)
    background: url(@img/live_banner.png) no-repeat top right
    background-size: cover
</style>
