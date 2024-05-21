<template lang="pug">
.rk-srcoll-area
  .srcoll-wrapper(ref="el")
    slot
  rk-scroll(:get-target="()=>$refs.el")
  rk-scroll(:get-target="()=>$refs.el" horizontal)
</template>
<style lang="sass" scoped>
.rk-srcoll-area
  position: relative
  > .srcoll-wrapper
    overflow: auto
    width: 100%
    height: 100%
    max-height: inherit
    scrollbar-width: none
    overscroll-behavior: none
    &::-webkit-scrollbar
      display: none
</style>
