<script setup lang="ts">
import { GameType, GetMoreGame, type Game } from '@/api/Game'
import { GetEGamePage, GetLivePage, GetLotteryPage } from '@/api/Page'
import Games from '@/components/layout/games.vue'
import RollingGames from '@/components/layout/rollingGames.vue'
import SearchLayout from '@/components/layout/searchLayout.vue'
import Tags from '@/components/layout/tags.vue'
import { useWebStore } from '@/stores/web'
import type { RespData } from '@/utils/request'
import useLang from '@/utils/useLang'
import _ from 'lodash'
import { reactive, computed, ref, inject, onMounted } from 'vue'
import GuessTitle from '@/components/layout/guessTitle.vue'
import RankedBoard from '@/components/layout/rankedBoard.vue'
import Empty from '../empty.vue'
import { GetRankInfo } from '@/api/Member'

const props = defineProps<{ type: GameType }>()
const typeAPI = {
  [GameType.Live]: GetLivePage,
  [GameType.Lottery]: GetLotteryPage,
  [GameType.Slot]: GetEGamePage,
}
const routeLoaded = inject('routeLoaded', () => {})
const webStore = useWebStore()
const { webTexts } = useLang()
const preferPageSize = ref(0)
const postData = reactive({
  GameName: '',
  Language: webStore.lang,
  GameType: props.type,
  GameKind: -1,
  Page: {
    PageIndex: 0,
    PageSize: 0,
  },
})
const loading = ref(1)
const lastTriggerEndPage = ref(0)
const pageResp = reactive<Omit<RespData<typeof GetEGamePage>, 'GameAll' | 'GameKindList'>>({
  GameFavorite: [],
  GameGuessLike: [],
  GameHot: [],
  GameRecent: [],
})
const ranked = ref<Awaited<ReturnType<typeof GetRankInfo>>[number]['RankData']['RankTable']>([])
const visible = reactive({
  hot: true,
  guess: true,
})
const kinds = ref<RespData<typeof GetEGamePage>['GameKindList']>([])
const gameListKey = ref(NaN)
const gameList = ref<Game[][]>([])

const isEndPage = computed({
  get: () => !~postData.Page.PageIndex,
  set(val) {
    if (val) postData.Page.PageIndex = -1
    else postData.Page.PageIndex = ~postData.Page.PageIndex ? postData.Page.PageIndex : 0
  },
})
const noScrollPadding = isEndPage
const tagOpts = computed(() => {
  const _t = webTexts.value
  return _.map(kinds.value, i => ({ label: _t[i.Key], value: i.Value }))
})
const gameListRender = computed(() => _.take(gameList.value, lastTriggerEndPage.value + 1))

function getTagsAttrs(formProps: { submit: () => void; postData: typeof postData }) {
  const _submit = (kind: number) => {
    formProps.postData.GameKind = kind
    postData.GameKind = kind

    if (formProps.postData.GameName) {
      formProps.submit()
    } else getNextPage(0)
  }
  return {
    modelValue: formProps.postData.GameKind,
    opts: tagOpts.value,
    defaultValue: -1,
    autoResetScroll: true,
    'onUpdate:modelValue'(val: unknown) {
      typeof val === 'number' && _submit(val)
    },
  }
}
function getNextPage(triggerPage: number, skipCatch?: boolean): Promise<void> {
  gameListKey.value = postData.GameKind
  if (!triggerPage) {
    gameList.value = []
    isEndPage.value = false
  }
  lastTriggerEndPage.value = triggerPage
  const nextPageIndex = triggerPage
  if (gameList.value[nextPageIndex] || isEndPage.value) {
    if ((gameList.value[nextPageIndex]?.length || 0) < postData.Page.PageSize) {
      isEndPage.value = true
    }
    return Promise.resolve()
  }
  postData.Page.PageIndex = triggerPage + 1
  if (postData.Page.PageIndex === 1) {
    postData.Page.PageSize = preferPageSize.value
  }
  gameList.value[nextPageIndex] = []
  return submit().catch(() => {
    if (skipCatch) return Promise.reject()
    return getNextPage(triggerPage + 1, true)
  })
}
function submit() {
  return GetMoreGame(postData).then(({ Data }) => {
    const args: Parameters<(typeof gameList)['value']['splice']> = [postData.Page.PageIndex - 1, 1]
    if (Data.length) args.push(Data)
    if (!Data.length || Data.length < postData.Page.PageSize) isEndPage.value = true
    gameList.value.splice(...args)
  })
}
function changePageSize(cellCount: number) {
  preferPageSize.value = cellCount * 4
  if (gameList.value[0]?.length || postData.Page.PageSize === preferPageSize.value) return
  getNextPage(0)
}
function searchendHandler() {
  if (gameListKey.value === postData.GameKind) return
  getNextPage(0)
}
function searchstartHandler() {
  noScrollPadding.value = false
  lastTriggerEndPage.value = 1
}

onMounted(() => {
  const post = typeAPI[props.type as keyof typeof typeAPI]
  if (!post) return
  post()
    .then(({ Data }) => {
      kinds.value = Data.GameKindList
      _.assign(pageResp, _.omit(Data, ['GameAll', 'GameKindList']))
      visible.guess = Boolean(pageResp.GameGuessLike.length)
      visible.hot = Boolean(pageResp.GameHot.length)
    })
    .finally(() => {
      loading.value = 0
      routeLoaded()
    })
  GetRankInfo({ GameType: props.type }).then(Data => {
    ranked.value = Data[0].RankData.RankTable
  })
})
</script>
<template lang="pug">
search-layout.type-layout
  template(#form)
    .banner     
    ranked-board(:list="ranked")
  .container
    slot(name="beforeSearch")
      rolling-games(v-if="visible.hot" :title="webTexts['热门排行']" limit :list="pageResp.GameHot" :default-row="1")
  search-layout.kind-search(:type="type" :scroll-padding="!noScrollPadding" @searchstart="searchstartHandler" @searchend="searchendHandler")
    template(#form="searchFormProps")
      tags(v-bind="getTagsAttrs(searchFormProps)" )
    template(v-for="(i,index) in gameListRender" :key="`${gameListKey}-${index}`")
      .container(:data-page="index+1")
        games(:list="i" :max-empty-row="4" @end="getNextPage(index+1)")
      .container.after-page(v-if="!index")
        slot(:name="`afterPage${index}`")
          games.recs(v-if="visible.guess" limit :list="pageResp.GameGuessLike" :default-row="1")
            template(#title)
              guess-title
    template(v-if="!gameListRender.length")
      games(v-if="loading" :list="[]" @resize="changePageSize")
      empty(v-else :type="3")
</template>
<style lang="sass" scoped>
.type-layout
  .banner
    width: 100%
    padding-top: 17.5%
    min-height: 150px
  .container
    padding: 0 var(--l-p-x)
    grid-template-columns: minmax(auto, 1700px)
    justify-content: center
    display: grid
    gap: 20px
    &:empty
      display: none
    &.after-page
      border: 1px solid #f2f2f2
      border-left: 0
      border-right: 0
      padding-top: var(--l-p-y)
      padding-bottom: var(--l-p-y)
      &:empty
        display: none
      > .recs
        --game-min-width: 325px
  :deep(> .search-body)
    &:not(.searching)
      gap: 30px
      padding-left: 0
      padding-right: 0
      grid-template-columns: 1fr
    > .container
      margin-bottom: calc(var(--l-p-y) * -1)
      &:empty + .kind-search
        margin-top: calc(var(--l-p-y) * -1)


    > .kind-search
      > .search-header
        background: #fff
        z-index: 1
        position: sticky
        top: -1px
        display: grid
        > form
          grid-auto-flow: column
          > .tags
            grid-column-start: 1
      > .search-body
        grid-template-columns: 1fr
        &:not(.searching)
          padding-left: 0
          padding-right: 0
          gap: 20px

@container main (width <= 800px)
  .type-layout :deep(.search-body)
    > .kind-search > .search-header > form
      grid-auto-flow: row
    > .container
      --l-p-x: 20px
      &.after-page > .recs
        --game-min-width: 170px
</style>
