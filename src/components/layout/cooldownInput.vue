<script setup lang="ts">
import { onBeforeUnmount, onBeforeMount, ref } from 'vue'
import cookieRef from '@/utils/cookieRef'
import useLang from '@/utils/useLang'
import RkInput from '../rkInput.vue'

const emit = defineEmits<{ (e: 'update:modelValue', val: unknown): void }>()
const props = defineProps<{ type: string; modelValue: string; sendCode: () => Promise<unknown> }>()
const { texts } = useLang()
let pid = -1

const cooldown = cookieRef(0, {
  key: `${props.type}-cooldown`,
  sameSite: 'strict',
  expires: 1 / 24 / 60,
})
const disabled = ref(0)

function setExpired() {
  disabled.value = 60
  cooldown.value = Date.now() + disabled.value * 1000
}
function getCode() {
  if (disabled.value || !props.modelValue) return
  setExpired()
  props
    .sendCode()
    .then(setExpired)
    .catch(() => {
      cooldown.value = 0
      disabled.value = 0
    })
}
function setDisabled() {
  disabled.value = parseInt((cooldown.value - Date.now()) / 1000 + '')
  if (disabled.value < 0) disabled.value = 0
}
function emitUpdate(val: unknown) {
  emit('update:modelValue', val)
}

onBeforeMount(() => {
  setDisabled()
  pid = setInterval(setDisabled, 1000)
})
onBeforeUnmount(() => {
  clearInterval(pid)
})
</script>
<template lang="pug">
rk-input(:model-value="modelValue" @update:model-value="emitUpdate")
  template(v-if="$slots.label" #label)
    slot(name="label")
  template(#suffix)
    span.code-btn(:class="{disabled:!modelValue || disabled}" @click="getCode") {{disabled? disabled + ' s':texts['发送验证码']}}
</template>
<style lang="sass" scoped>
.code-btn
  cursor: pointer
  color: #9f7981
  font-size: 13px
  line-height: 22px
  border-radius: 4px
  padding: 0 5px
  background: #e82b42
  color: white
  &:not(.disabled):hover
    transform: scale(1.03)
  &.disabled
    opacity: 0.4
    cursor: not-allowed
</style>
