<script setup lang="ts">
import TypeLayout from '@/components/layout/typeLayout.vue'
import { GameType } from '@/api/Game'
</script>
<template lang="pug">
type-layout#lottery(:type="GameType.Lottery")
</template>
<style lang="sass" scoped>
#lottery
  :deep(.banner)
    background: url(@img/lottery_banner.png) no-repeat top right
    background-size: cover
</style>
