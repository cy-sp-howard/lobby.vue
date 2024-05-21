<script setup lang="ts">
import TypeLayout from '@/components/layout/typeLayout.vue'
import { GameType } from '@/api/Game'
</script>
<template lang="pug">
type-layout#egame(:type="GameType.Slot")
</template>
<style lang="sass" scoped>
#egame
  :deep(.banner)
    background: url(@img/egame_banner.png) no-repeat top right
    background-size: cover
</style>
