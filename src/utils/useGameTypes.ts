import { GameType } from '@/api/Game'
import { useLangStore } from '@/stores/lang'
import { computed } from 'vue'

export default function (
  filterCall: Parameters<
    ReturnType<
      typeof Array<{
        label: string
        value: GameType
      }>
    >['filter']
  >[0] = () => true,
) {
  const langStore = useLangStore()
  return computed(() => {
    const _t = langStore.texts.Web
    return [
      {
        label: _t.all,
        value: GameType.All,
      },
      {
        label: _t.Chess,
        value: GameType.Chess,
      },
      {
        label: _t.ESports,
        value: GameType.ESports,
      },
      {
        label: _t.Live,
        value: GameType.Live,
      },
      {
        label: _t.Lottery,
        value: GameType.Lottery,
      },
      {
        label: _t.Slot,
        value: GameType.Slot,
      },
      {
        label: _t.Sports,
        value: GameType.Sports,
      },
    ].filter(filterCall)
  })
}
