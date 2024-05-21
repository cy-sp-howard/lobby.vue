import type { App } from 'vue'
import SvgIcon from './svgIcon.vue'
import RkScrollbar from './rkScrollbar.vue'
export default {
  install(app: App) {
    app.component('RkScroll', RkScrollbar)
    app.component('SvgIcon', SvgIcon)
  },
}
