<script lang="ts">
import _ from 'lodash'
import { useWebStore } from '@/stores/web'
import useAnchorObserver from '@/utils/useAnchorObserver'
import { type VNode, h, nextTick, Teleport, Transition, ref, reactive, defineComponent } from 'vue'

export default defineComponent({
  props: {
    class: {
      default: undefined,
      validator() {
        return true
      },
    },
    text: {
      required: true,
      type: String,
    },
    anchorY: {
      default: 'top',
      type: String,
    },
    anchorX: {
      default: 'right',
      type: String,
    },
    to: {
      default: 'body' as HTMLElement | string | false,
      validator: () => true,
    },
    z: {
      default: 1,
      type: Number,
    },
    absolute: {
      default: false,
      type: Boolean,
    },
  },
  setup(props, ctx) {
    const { triggerAnchor } = props.absolute
      ? {
          triggerAnchor() {
            const el = slotNode?.el
            if (!(el instanceof HTMLElement)) return
            setPos({
              left: el.offsetLeft,
              right: el.offsetLeft + el.offsetWidth,
              top: el.offsetTop,
              bottom: el.offsetTop + el.offsetHeight,
            })
          },
        }
      : useAnchorObserver(
          () => {
            return slotNode?.el
          },
          setPos,
          () => show.value,
          () => {
            closeText()
            selfClose()
          },
        )

    let slotNode: VNode | null = null
    const defaultStyle = {
      top: 'unset',
      left: 'unset',
      bottom: 'unset',
      right: 'unset',
      height: 'unset',
      width: 'unset',
    }

    let mouseInTip = false
    let gotCloseEvent = false
    const webStore = useWebStore()
    const show = ref(false)
    const tipStyle = reactive(_.clone(defaultStyle))
    const overflowState = reactive({
      left: false,
      top: false,
      right: false,
      bottom: false,
    })

    function getEdge() {
      const el = slotNode?.el?.parentElement
      if (!(el instanceof HTMLElement) || !props.absolute)
        return { x: webStore.size.vw, y: webStore.size.vh }
      const containerRight = el.offsetWidth
      const containerBottom = el.offsetHeight
      return { x: containerRight, y: containerBottom }
    }
    function setPos(rect: Pick<DOMRectReadOnly, 'left' | 'right' | 'top' | 'bottom'>) {
      _.assign(tipStyle, defaultStyle)
      const { left, right, top, bottom } = rect
      const edge = getEdge()
      if (props.anchorX === 'left' && !overflowState.left) {
        tipStyle.left = left + 2 + 'px'
      } else {
        const rightRange = edge.x - right
        tipStyle.right = rightRange + 2 + 'px'
      }
      if (props.anchorY === 'bottom' && !overflowState.bottom) {
        tipStyle.top = bottom + 2 + 'px'
      } else {
        const bottomRange = edge.y - top
        tipStyle.bottom = bottomRange + 2 + 'px'
      }
    }
    function showText() {
      mouseInTip = false
      gotCloseEvent = false
      show.value = true
      triggerAnchor()
      nextTick(() => {
        if (checkOverflow()) triggerAnchor()
      })
    }
    function checkOverflow() {
      const el = slotNode?.el
      if (!(el instanceof HTMLElement) || props.absolute) return
      const { left, right, top, bottom } = el.getBoundingClientRect()
      const edge = getEdge()
      overflowState.left = left < 0
      overflowState.top = top < 0
      overflowState.bottom = bottom > edge.y
      overflowState.right = right > edge.x
      return overflowState.left || overflowState.top || overflowState.bottom || overflowState.right
    }
    function selfClose() {
      mouseInTip = false
      if (gotCloseEvent === true) {
        show.value = false
      }
    }
    function closeText() {
      setTimeout(() => {
        if (mouseInTip) {
          gotCloseEvent = true
        } else {
          show.value = false
          overflowState.left = false
          overflowState.top = false
          overflowState.bottom = false
          overflowState.right = false
        }
      }, 100)
    }
    return () => {
      const vnodes = []
      if (ctx.slots.default) {
        const slots = ctx.slots.default({ showText, closeText })
        if (slots.length) {
          slotNode = slots[0]
          vnodes.push(slotNode)
        }

        const ary: VNode[] = []
        if (show.value && props.text) {
          ary.push(
            h(
              'pre',
              {
                class: [props.class, 'rk-tip', { absolute: props.absolute }],
                style: tipStyle,
                onMouseenter() {
                  mouseInTip = true
                },
                onMouseleave: selfClose,
              },
              props.text,
            ),
          )
        }
        const tipContent = h(
          Transition,
          { name: 'fade', appear: true },
          {
            default() {
              return ary
            },
          },
        )
        const tip =
          props.to === false
            ? tipContent
            : h(Teleport, { to: typeof props.to === 'boolean' ? 'body' : props.to }, tipContent)

        vnodes.push(tip)
      }
      return vnodes
    }
  },
})
</script>
<style lang="sass" scoped>
.rk-tip
  position: fixed
  background: #406aff
  border-radius: 3px
  margin: 0
  padding: 5px 20px
  font-size: 14px
  max-width: 50vw
  max-height: 50vw
  z-index: v-bind(z)
  color: white
  white-space: pre-wrap
  &.absolute
    position: absolute
    white-space: nowrap
</style>
