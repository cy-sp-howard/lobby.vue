/// <reference types="vite/client" />
import 'yup'
import 'vue-router'
import '@types/grecaptcha'
import SvgIcon from '@/components/svgIcon.vue'
import RkScrollbar from '@/components/rkScrollbar.vue'

declare module 'yup' {
  import type { Message } from 'yup'
  interface StringSchema {
    equal(ref: Ref, message?: Message): this
    notEqual(ref: Ref, message?: Message): this
    azDig6to12(): this
    upperInside(): this
    phone(): this
    mail(): this
    line(): this
  }
}

declare module 'vue' {
  interface ComponentInternalInstance {
    provides: Record<string | symbol, unknown>
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    auth?: boolean
  }
  export interface GlobalComponents {
    SvgIcon: typeof SvgIcon
    RkScrollbar: typeof RkScrollbar
  }
}
