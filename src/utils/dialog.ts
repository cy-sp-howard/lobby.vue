import Dialogue from '@/components/rkDialog.vue'
import mountVue, { type ComponentProps } from './mountVue'
import _ from 'lodash'
import {
  type ComponentPublicInstance,
  type Component,
  getCurrentInstance,
  onBeforeUnmount,
  Teleport,
  h,
  provide,
  ref,
  onBeforeMount,
} from 'vue'

type Dialog$Props = ComponentProps<typeof Dialogue>
type DialogProps = {
  -readonly [Key in keyof Dialog$Props]: Dialog$Props[Key]
} & Record<string, unknown>

export default class Dialog<T extends Component> {
  app: ReturnType<typeof mountVue> | undefined
  dialogProps: DialogProps = {}
  root: ComponentPublicInstance | undefined
  private provides: Record<string | symbol, unknown> = {}
  private contentComponent: Component
  constructor(content: T, dialogProps?: DialogProps) {
    this.root = undefined
    this.app = undefined

    this.contentComponent = content
    dialogProps && (this.dialogProps = dialogProps)

    // 若在setup，該 component 消失時關閉談窗
    const vueInstance = getCurrentInstance()
    if (vueInstance) {
      onBeforeMount(() => {
        _.assign(
          this.provides,
          vueInstance.parent === null
            ? vueInstance.vnode.appContext && vueInstance.vnode.appContext.provides
            : vueInstance.parent.provides,
          vueInstance.provides,
        )
      })
      onBeforeUnmount(() => {
        _.invoke(this.dialog, 'close')
      })
    }
  }
  get content(): unknown {
    return this.root?.$refs.content
  }
  get dialog(): unknown {
    return this.root?.$refs.dialog
  }
  private closeMask() {
    if (!this.app) return
    setMask(-1)
  }
  open(contentProps?: ComponentProps<T>, contentChildren?: Record<string, unknown>) {
    const _this = this
    if (_this.app) return
    setMask(1)
    _this.app = mountVue({
      component: {
        setup() {
          const instance = getCurrentInstance()
          const key = ref(0)
          provide('reload', (props: typeof contentProps) => {
            contentProps = _.assign({}, contentProps, props)
            key.value += 1
          })
          _.each(_this.provides, (i, k) => provide(k, i))
          if (instance?.proxy) {
            _this.root = instance.proxy
          }
          return { key }
        },
        render() {
          return h(
            Teleport,
            { to: 'body' },
            h(
              Dialogue,
              _.assign({}, _this.dialogProps, {
                onClosing: () => {
                  _this.closeMask.call(_this)
                  const { onClosing } = _this.dialogProps
                  onClosing instanceof Function && onClosing()
                },
                onClosed: () => {
                  _this.root = undefined
                  if (_this.app) {
                    _this.app.unmount()
                    _this.app = undefined
                  }
                  const { onClosed } = _this.dialogProps
                  onClosed instanceof Function && onClosed()
                },
                ref: 'dialog',
              }),
              {
                default: () =>
                  h(
                    _this.contentComponent,
                    _.assign(
                      {
                        ref: 'content',
                        key: this.key,
                      },
                      contentProps,
                    ),
                    contentChildren,
                  ),
              },
            ),
          )
        },
      },
    })
  }
  close() {
    _.invoke(this.dialog, 'close')
  }
}

let maskElement: HTMLElement

function setMask(val: 1 | -1) {
  if (!maskElement) {
    maskElement = document.createElement('span')
    maskElement.classList.add('mask')
    document.body.prepend(maskElement)
  }
  const el = maskElement
  const count = (Number(el.dataset.mask) || 0) + val
  el.dataset.mask = String(count)
  if (count) {
    document.body.style.overflow = 'hidden'
  }
  return new Promise<void>(rs => {
    const abortCtrl = new AbortController()
    maskElement.addEventListener(
      'transitionend',
      () => {
        rs()
        if (!count) {
          document.body.style.overflow = ''
        }
        abortCtrl.abort()
      },
      { signal: abortCtrl.signal },
    )
  })
}
