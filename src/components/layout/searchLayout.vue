<script setup lang="ts">
import RkInput from '@/components/rkInput.vue'
import Games from './games.vue'
import { reactive, ref, computed, watch, useSlots, onMounted } from 'vue'
import useLang from '@/utils/useLang'
import { GameType, SearchGame } from '@/api/Game'
import { useWebStore } from '@/stores/web'
import type { RespData } from '@/utils/request'
import _ from 'lodash'
import Empty from '../empty.vue'

const emit = defineEmits<{ (e: 'searchstart'): void; (e: 'searchend'): void }>()
const props = defineProps<{ type?: GameType; scrollPadding?: boolean }>()

const slots = useSlots()
const webStore = useWebStore()
const { texts } = useLang()
const el = ref<HTMLElement | null>(null)
const postData = reactive({
  GameName: '',
  Language: webStore.lang,
  GameType: props.type ?? -1,
  GameKind: -1,
  Page: {
    PageIndex: 0, // 0未初始化 -1已到最終頁
    PageSize: 0,
  },
})
const currentCellCount = ref(0)
const lastPostData: Partial<typeof postData> = reactive({})
const searchResps = ref<RespData<typeof SearchGame>[]>([])
const searchState = reactive({
  hint: '',
  loading: 0,
  searching: false,
})

const keepSearching = computed(() => !slots.default)
const isEndPage = computed({
  get() {
    return !~postData.Page.PageIndex
  },
  set(val) {
    if (val) postData.Page.PageIndex = -1
    else postData.Page.PageIndex = ~postData.Page.PageIndex ? postData.Page.PageIndex : 0
  },
})
const searchKey = computed(
  () => `${lastPostData.GameType}-${lastPostData.GameKind}-${lastPostData.GameName}`,
)
const bodyClass = computed(() => {
  return {
    'loading-logo': searchState.loading,
    searching: searchState.searching,
    'scroll-padding': searchState.searching
      ? !isEndPage.value && !searchState.loading
      : props.scrollPadding,
  }
})

watch(
  () => searchState.searching,
  ni => {
    if (!ni) {
      emit('searchend')
      return
    }
    emit('searchstart')
  },
)

function getScrollableParent(el: HTMLElement) {
  const parent = el.parentElement
  if (!parent) return el
  const isScrollable = parent.clientWidth !== parent.offsetWidth
  const isRoot = parent === document.documentElement
  if (isScrollable || isRoot) return parent
  return getScrollableParent(parent)
}
function reset() {
  isEndPage.value = true
  searchState.hint = ''
  searchResps.value = []
  lastPostData.GameName = ''
}
function startLoading() {
  if (postData.Page.PageIndex === 1) {
    searchState.loading += 1

    return () => {
      searchState.loading -= 1
    }
  } else {
    return () => {}
  }
}
function setPageSize() {
  if (postData.Page.PageIndex === 1) {
    return new Promise<void>(rs => {
      if (currentCellCount.value) rs()
      else {
        watch(currentCellCount, () => rs(), { once: true })
      }
    }).then(() => {
      postData.Page.PageSize = currentCellCount.value * 20
    })
  } else return Promise.resolve()
}
function submit() {
  // from nextpage,custom submit, select record,enter
  if (!_.isEqual(_.omit(postData, ['Page']), _.omit(lastPostData, ['Page']))) {
    reset()
    postData.Page.PageIndex = 1
  }
  if ((!keepSearching.value && !postData.GameName) || isEndPage.value) return
  searchState.searching = true
  const targetIndex = postData.Page.PageIndex - 1
  const isFirstPage = postData.Page.PageIndex === 1
  searchResps.value[targetIndex] = []
  if (isFirstPage && el.value) {
    const parent = getScrollableParent(el.value)
    parent.scrollTop = 0 // sticky 不歸0會不准
    parent.scrollTop = el.value?.offsetTop || 0
  }

  _.assign(lastPostData, _.cloneDeep(postData))
  const endLoading = startLoading()
  setPageSize()
    .then(() => SearchGame(postData))
    .then(({ Data, Message }) => {
      if (Data.length) {
        searchResps.value.splice(targetIndex, 1, Data)
      } else if (isFirstPage) {
        return Promise.reject(new Error(texts.value['查无资料']))
      } else {
        searchResps.value.splice(targetIndex, 1)
        return Promise.reject(new Error(Message))
      }
    })
    .catch(resp => {
      const isErrAgain = _.chain(searchResps.value)
        .takeRight(2)
        .every(i => !i.length)
        .value()

      if (isFirstPage) {
        searchState.hint = resp instanceof Error ? resp.message : 'err'
      } else if (!isErrAgain) {
        nextSearchPage(postData.Page.PageSize)
        return
      }
      isEndPage.value = true
    })
    .finally(endLoading)
}
function changePageSize(cellCount: number) {
  currentCellCount.value = cellCount
}
function nextSearchPage(triggerPageChildrenCount: number) {
  if (isEndPage.value || postData.Page.PageSize > triggerPageChildrenCount) {
    isEndPage.value = true
    return
  }
  postData.Page.PageIndex += 1
  submit()
}
function blurHandler() {
  if (postData.GameName || keepSearching.value) return
  searchState.searching = false
  reset()
}
onMounted(() => {
  if (keepSearching.value) submit()
})
</script>
<template lang="pug">
.search-layout(ref="el")
  .search-header
    form(@submit.prevent)
      rk-input(v-model="postData.GameName" :record-key="type ?? -1" placeholder="search" :record="10" @selected="submit" @enter="submit" @blur.capture="blurHandler")
      slot(name="form" :post-data="postData" :submit="submit")
  .search-body(:class="bodyClass")
    template(v-if="searchState.searching")
      empty(v-if="searchState.hint" :text="searchState.hint" :type="3")
      template(v-else)
        games(v-for="(i,index) in searchResps" :key="searchKey+index" :list="i" :data-page="index+1" @resize="changePageSize" @end="nextSearchPage(i.length)")
    slot(v-else)   
</template>

<style lang="sass" scoped>
.search-layout
  display: grid
  align-content: start
  > div
    --l-p-y: 30px
    --l-p-x: 40px
    padding: var(--l-p-y) var(--l-p-x)
    display: grid
    justify-content: center
    align-content: start
    grid-template-columns: minmax(auto,1700px)
    &.search-header
      --l-p-y: 20px
      padding-bottom: calc(var(--l-p-y) / 2)
      border-bottom: 1px solid #f2f2f2
      > form
        display: grid
        grid-template-columns: 1fr
        gap: 20px
        :deep(.rk-input)
          width: fit-content
          > input
            background: #F6F6F6
    &.search-body
      min-height: 400px
      gap: 70px
      &.loading-logo::after
        max-height: 400px

      &.scroll-padding
        padding-bottom: 2000px
      &.searching
        gap: 20px

@container main (width <= 800px)
  .search-layout > div
    --l-p-y: 20px
    --l-p-x: 20px
    &.search-header
      --l-p-y: 10px
      > form
        --rk-form-item-width: 100%
        gap: 10px 0
        > .rk-input
          width: 100%
</style>
