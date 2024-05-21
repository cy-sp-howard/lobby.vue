<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{ icon: string }>()
const iconName = computed(() => `icon-${props.icon}`)
</script>
<template lang="pug">
svg.svg-icon(:class="iconName" aria-hidden="true" xmlns="http://www.w3.org/2000/svg")
  use(:xlink:href="'#'+iconName")
</template>

<style lang="sass" scoped>
.svg-icon
  width: 1.2em
  height: 1.2em
  vertical-align: -0.15em
  fill: currentColor
  overflow: hidden
</style>
