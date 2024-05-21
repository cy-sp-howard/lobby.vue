<script setup lang="ts">
defineProps<{ type: string }>()
</script>
<template lang="pug">
i.label-icon(:class="type")
</template>
<style lang="sass" scoped>
.label-icon
  width: 24px
  height: 100%
  display: inline-block
  background-repeat: no-repeat
  background-position: center center
  &.mail
    // background-image: url('@img/icon_mail.png')
  &.account
    // background-image: url('@img/icon_user.png')
  &.pwd
    // background-image: url('@img/icon_password.png')
  &.code
    // background-image: url('@img/icon_verification_Code.png')
  &.phone
    // background-image: url('@img/icon_phone.png')
  &.currency
    // background-image: url('@img/icon_money.png')
  &.protocol
    background-image: url('@img/icon_protocol.png')
  &.address
    // background-image: url('@img/icon_address.png')
  &.remark
    // background-image: url('@img/icon_remark.png')
.rk-input > input
  &:hover,&:focus
    + .label
      > .account
        // background-image: url('@img/icon_user_h.png')
      > .pwd
        // background-image: url('@img/icon_password_h.png')
      > .code
        // background-image: url('@img/icon_verification_Code_h.png')
      > .mail
        // background-image: url('@img/icon_mail_h.png')
      > .phone
        background-image: url('@img/icon_phone_h.png')
      > .currency
        // background-image: url('@img/icon_money_h.png')
      > .protocol
        // background-image: url('@img/icon_protocol_h.png')
      > .address
        // background-image: url('@img/icon_address_h.png')
      > .remark
        // background-image: url('@img/icon_remark_h.png')
</style>
