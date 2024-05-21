<script lang="ts">
import _ from 'lodash'
import { h } from 'vue'
export default {
  props: {
    text: {
      type: String,
      required: true,
    },
  },
  setup(props, { slots }) {
    return () => {
      const childrenVnodes = _.chain(props.text)
        .split(/{{([\s\S]+?)}}/g)
        .map((i, index) => {
          const isKey = index % 2
          const _s = slots[i]
          if (isKey && _s) {
            return _s()
          }
          return i
        })
        .compact()
        .value()
      return h('pre', null, childrenVnodes)
    }
  },
}
</script>
<style lang="sass" scoped>
pre
  white-space: pre-wrap
</style>
