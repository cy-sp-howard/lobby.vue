<script setup lang="ts">
import useLang from '@/utils/useLang'
import { computed } from 'vue'

const props = defineProps<{ text?: string; type?: number }>()
const { webTexts } = useLang()

const defaultText = computed(() => {
  switch (props.type) {
    case 2:
      return props.text ?? webTexts.value['无投注记录']
    case 3:
      return props.text ?? webTexts.value['查无资料']

    default:
      return props.text ?? webTexts.value['无资料']
  }
})
</script>
<template lang="pug">
strong.empty(:class="`type-${type}`") {{ defaultText }}
</template>
<style lang="sass" scoped>
.empty
  font-size: 15px
  color: #B7B7B7
  text-align: center
  font-weight: normal
  display: block
  &::before
    content: ''
    display: block
    background: var(--icon,url(@img/empty.png)) no-repeat center bottom
    background-size: 360px
    height: 200px
  &.type-2
    --icon: url(@img/no_record.png)
  &.type-3
    --icon: url(@img/no_result.png)
</style>
