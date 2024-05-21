<script lang="ts">
import { ref, provide, computed, h, defineComponent, type VNode } from 'vue'
import RkTableCol from './rkTableCol.vue'
import RkTableRow from './rkTableRow.vue'
import SvgIcon from '../svgIcon.vue'
import _ from 'lodash'
export default defineComponent({
  props: {
    rowData: {
      type: Object,
      default: undefined,
    },
  },
  setup(props, { slots, attrs }) {
    const isUnfold = ref(false)

    function foldSwitch() {
      isUnfold.value = !isUnfold.value
    }

    provide(
      'rowData',
      computed(() => props.rowData),
    )
    return () => {
      const defaultSlot = slots.default ? slots.default() : []
      const trProps: { class: unknown[]; onClick?: Function } = {
        class: [attrs.class, 'rk-table-row', { unfold: isUnfold.value }],
      }
      const rootNode = []

      const cols = defaultSlot[0]?.children as VNode[]
      if (_.isArray(cols)) {
        const fold = _.remove(cols, i => {
          return i.props?.fold || i.props?.fold === ''
        })

        if (fold.length) {
          cols.unshift(
            h(RkTableCol, { w: 20 }, () => h(SvgIcon, { class: 'fold-arrow', icon: 'down' })),
          )
          trProps.onClick = foldSwitch
          trProps.class.push('foldable')
        }
        if (props.rowData && isUnfold.value) {
          _.each(fold, i => {
            _.assign(i.props, { colspan: cols.length })
            rootNode.push(
              h('tr'),
              h(RkTableRow, { rowData: props.rowData }, () => i),
            )
          })
        }
      }
      rootNode.unshift(h('tr', trProps, defaultSlot))
      return rootNode
    }
  },
})
</script>
<style lang="sass" scoped>
.rk-table-row
  --row-even-bg: #FAFBFF
  --row-hover-bg: #F6F8FF
  background: var(--rk-bg)
  &:nth-of-type(even)
    background: var(--row-even-bg)
    &:hover
      background: linear-gradient(var(--row-hover-bg),var(--row-hover-bg)) ,linear-gradient(var(--row-even-bg),var(--row-even-bg))
  &:hover
    background: var(--row-hover-bg)
  &.foldable
    cursor: pointer
  .fold-arrow
    transform: rotate(-90deg)
    transition: transform 0.2s
  &.unfold
    .fold-arrow
      transform: rotate(0)
    + tr + tr
      box-shadow: inset 0 0 10px #0003
</style>
