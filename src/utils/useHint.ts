import type { ComponentProps } from './mountVue'
import RkHint from '@/components/rkHint.vue'
import Dialog from '@/utils/dialog'
import _ from 'lodash'

type HintProps = ComponentProps<typeof RkHint>

export default function () {
  const app = new Dialog(RkHint, { title: '' })

  function showHint(content: unknown, props?: Partial<HintProps & { title: string }>) {
    return new Promise((rs, rj) => {
      app.dialogProps.title = props?.title
      app.dialogProps.onClosed = () => rj('canceled hint without button')
      app.close()
      const defaultCall = {
        confirmCall() {
          rs(props?.confirmCall && props?.confirmCall())
        },
        cancelCall() {
          props?.cancelCall && props?.cancelCall()
          rj((props?.cancelCall && props?.cancelCall()) || 'canceled hint by button')
        },
      }
      app.open(_.assign(_.clone(props), defaultCall), { default: () => content })
    })
  }
  function justHint(msg: string) {
    return showHint(msg, { cancelText: '' })
  }
  function errApiHint(data: Record<string, unknown>) {
    if (data.status === 401) return
    return justHint(
      String(
        data.Message ||
          `${data.status || ''} ${data.title || data.statusText || data.message || ''}`,
      ),
    )
  }
  return { showHint, justHint, errApiHint }
}
