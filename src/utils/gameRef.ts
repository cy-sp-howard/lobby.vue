import type { Game } from '@/api/Game'
import _ from 'lodash'
import { onBeforeUnmount, customRef, reactive, watch, type Ref, onBeforeMount } from 'vue'

const maxDBSize = 500

const defaultGame: Game & { picExt: string; visibleCount: number } = {
  picExt: 'png',
  GameCode: '',
  visibleCount: 0,
  GameType: -1,
  GameKind: -1,
  GameChineseName: '',
  GameEnglishName: '',
  PlatformChineseName: '',
  PlatformEnglishName: '',
  IsFavorite: false,
  Platform: '',
  Count: 0,
}
const emptyGame = reactive(_.assign({}, defaultGame, { picExt: '' }))
const db = new Map<string, typeof defaultGame>()

function getGame(item: Game): typeof defaultGame {
  if (!item.Platform) return emptyGame
  const game = db.get(item.GameCode)
  if (game === item || game?.visibleCount) return game

  const _defaultData = _.pick(game || defaultGame, ['picExt', 'visibleCount'])
  const _item = _.assign(reactive(item), _defaultData)
  db.set(item.GameCode, _item)
  return _item
}

export default function (item: Ref<Game>) {
  let db_item: typeof defaultGame = getGame(item.value)
  let db_itemUpdated = () => {}

  watch(item, ni => {
    invisibleHandler()
    db_item = getGame(ni)
    visibleHandler()
    db_itemUpdated()
  })

  function visibleHandler() {
    db_item.visibleCount += 1
  }
  function invisibleHandler() {
    db_item.visibleCount -= 1
    if (db.size > maxDBSize && !db_item.visibleCount) {
      db.delete(db_item.GameCode)
    }
  }

  onBeforeMount(visibleHandler)
  onBeforeUnmount(invisibleHandler)

  return customRef((track, trigger) => {
    db_itemUpdated = trigger
    return {
      get() {
        track()
        return db_item
      },
      set() {},
    }
  })
}
