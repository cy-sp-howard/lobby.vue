<script lang="ts" setup>
import { useLangStore } from '@/stores/lang'
import { computed, inject } from 'vue'

const props = defineProps<{
  confirmText?: string
  cancelText?: string
  confirmCall: () => void
  cancelCall: () => void
}>()

const langStore = useLangStore()
const close = inject<() => void>('close') || (() => {})

const texts = computed(() => {
  return langStore.texts.Web
})

function confirm() {
  props.confirmCall()
  close()
}
function cancel() {
  props.cancelCall()
  close()
}
</script>
<template lang="pug">
.rk-hint-dialog
  div
    slot
  footer
    rk-button(v-if="cancelText !== ''" color="hollow" @click="cancel") {{ cancelText || texts["取消"] }}
    rk-button(v-if="confirmText !== ''" color="error" @click="confirm") {{ confirmText || texts["确认"] }}
</template>
<style lang="sass" scoped>
.rk-hint-dialog
  > div
    padding-bottom: 20px
    white-space: pre-wrap
  > footer
    display: grid
    grid-auto-flow: column
    justify-content: flex-end
    gap: 10px
</style>
