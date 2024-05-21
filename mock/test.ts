import type { mockConfig } from './index'
import _ from 'lodash'

const ary = [
  'BB603001',
  'BB603007',
  'BB603008',
  'BB603011',
  'BB603012',
  'BB603015',
  'BB603025',
  'BB603026',
  'BB603027',
  'BB603028',
  'BB603029',
  'BB603030',
  'BB603031',
  'BB603032',
  'BB603033',
  'BB603034',
  'BB603036',
  'BB603037',
  'BB603038',
  'BB603039',
  'BB603041',
  'BB603042',
  'BB603043',
  'BB603045',
  'BB603046',
  'BB603047',
  'BB603048',
  'BB603050',
  'BB6230588',
  'BB6230590',
  'BB6230592',
  'BB6230593',
  'BB6230594',
  'BB6230595',
  'BB6230598',
  'BB6230599',
  'BB6238001',
  'BB6238002',
  'BB625006',
  'BB625008',
  'BB625009',
  'BB625013',
  'BB625014',
  'BB625027',
  'BB625030',
  'BB625040',
  'BB625041',
  'BB625043',
  'BB625044',
]
let index = 0

function randomText() {
  index += 1
  return ary[index % ary.length]
}
function getGame(opts?: Partial<{ type: number; kind: number; fav: boolean; code: string }>) {
  const kinds = [1, 5, 8, 10, 13, 21, 22, 23, 24, 25, 26, 27, 28]
  const types = [1, 2, 4, 8, 16, 64]

  return {
    Platform: 'BBIN',
    PlatformEnglishName: 'BBIN',
    PlatformChineseName: 'BBIN',
    GameCode: opts?.code || randomText(),
    GameType: opts?.type || _.sample(types),
    GameKind: opts?.kind || _.sample(kinds),
    GameChineseName: 'Game Name',
    GameEnglishName: 'Game Name',
    IsFavorite: opts?.fav || false,
    Count: 1,
  }
}
const list: mockConfig[] = [
  {
    url: '/api/User/Validate',
    timeout: _.random(20, 1000),
    method: 'post',
    response: {
      Code: 0,
      Data: {
        UserToken: 'token',
        RespData: {
          Avatar: '',
          Balance: 999,
          Banner: [],
          Currency: 'INR',
          GameFavorite: _.times(8, () => getGame()),
          GameGuessLike: _.times(5, () => getGame()),
          GameHot: _.times(10, () => getGame()),
          GameNew: _.times(5, () => getGame()),
          GameRecent: _.times(7, () => getGame()),
          GameKindList: [
            {
              Key: 'EGame_ArcadeGame',
              Value: 1,
            },
            {
              Key: 'EGame_TableGames',
              Value: 10,
            },
            {
              Key: 'EGame_SlotGame',
              Value: 5,
            },
          ],
          Language: 'en_US',
          Notify: false,
        },
      },
      ExtensionData: null,
      Message: '',
      Success: true,
      Pagination: null,
    },
  },
  {
    url: '/api/User/Validate',
    timeout: _.random(20, 1000),
    method: 'post',
    response: {
      Code: 0,
      Data: {
        UserToken: 'token',
        RespData: {
          Avatar: '',
          Balance: 999,
          Banner: [],
          Currency: 'INR',
          GameFavorite: _.times(5, () => getGame()),
          GameGuessLike: _.times(5, () => getGame()),
          GameHot: [],
          GameNew: _.times(5, () => getGame()),
          GameRecent: _.times(5, () => getGame()),
          GameKindList: [
            {
              Key: 'EGame_ArcadeGame',
              Value: 1,
            },
            {
              Key: 'EGame_TableGames',
              Value: 10,
            },
            {
              Key: 'EGame_SlotGame',
              Value: 5,
            },
          ],
          Language: 'en_US',
          Notify: false,
        },
      },
      ExtensionData: null,
      Message: '',
      Success: true,
      Pagination: null,
    },
  },
  {
    url: '/api/Page/LotteryPage',
    method: 'post',
    timeout: _.random(20, 1000),
    response: {
      Code: 0,
      Data: {
        GameKindList: [
          {
            Key: 'EGame_ArcadeGame',
            Value: 1,
          },
          {
            Key: 'EGame_SlotGame',
            Value: 5,
          },
        ],
        GameGuessLike: _.times(6, () => getGame()),
        GameFavorite: _.times(6, () => getGame()),
        GameRecent: _.times(6, () => getGame()),
        GameHot: _.times(6, () => getGame()),
        GameAll: _.times(20, () => getGame()),
      },
      ExtensionData: null,
      Message: '',
      Success: true,
      Pagination: null,
    },
  },
  {
    url: '/api/Page/LivePage',
    timeout: _.random(20, 1000),
    method: 'post',
    response: {
      Code: 0,
      Data: {
        GameKindList: [
          {
            Key: 'EGame_ArcadeGame',
            Value: 1,
          },
          {
            Key: 'EGame_SlotGame',
            Value: 5,
          },
        ],
        GameGuessLike: _.times(6, () => getGame()),
        GameFavorite: _.times(6, () => getGame()),
        GameRecent: _.times(6, () => getGame()),
        GameHot: _.times(6, () => getGame()),
        GameAll: _.times(20, () => getGame()),
      },
      ExtensionData: null,
      Message: '',
      Success: true,
      Pagination: null,
    },
  },
  {
    url: '/api/Page/FavoritePage',
    timeout: _.random(20, 1000),
    method: 'post',
    response: {
      Code: 0,
      Data: {
        EGame_ArcadeGame: _.times(6, () => getGame({ fav: true })),
        EGame_SlotGame: _.times(62, () => getGame({ fav: true })),
        EGame_InteractiveGames: _.times(16, () => getGame({ fav: true })),
        EGame_TableGames: _.times(6, () => getGame({ fav: true })),
        EGame_FishGame: _.times(20, () => getGame({ fav: true })),
        Live_Baccarat: _.times(20, () => getGame({ fav: true })),
      },
      ExtensionData: null,
      Message: '',
      Success: true,
      Pagination: null,
    },
  },
  {
    url: '/api/Game/Login',
    timeout: _.random(20, 1000),
    status: 500,
    method: 'post',
  },
  {
    url: '/api/Page/HotGamePage',
    timeout: _.random(20, 1000),
    method: 'post',
    response: {
      Code: 0,
      Data: {
        EGame_ArcadeGame: _.times(6, () => getGame({ fav: true })),
        EGame_SlotGame: _.times(62, () => getGame({ fav: true })),
        EGame_InteractiveGames: _.times(16, () => getGame({ fav: true })),
        GameGuessLike: _.times(6, () => getGame({ fav: true })),
        EGame_FishGame: _.times(20, () => getGame({ fav: true })),
        Live_Baccarat: _.times(20, () => getGame({ fav: true })),
      },
      ExtensionData: null,
      Message: '',
      Success: true,
      Pagination: null,
    },
  },
  {
    url: '/api/Page/EGamePage',
    timeout: _.random(20, 1000),
    method: 'post',
    response: {
      Code: 0,
      Data: {
        GameKindList: [
          {
            Key: 'EGame_ArcadeGame',
            Value: 1,
          },
          {
            Key: 'EGame_SlotGame',
            Value: 5,
          },
        ],
        GameGuessLike: _.times(6, () => getGame()),
        GameFavorite: _.times(6, () => getGame()),
        GameRecent: _.times(6, () => getGame()),
        GameHot: _.times(6, () => getGame()),
        GameAll: _.times(20, () => getGame()),
      },
      ExtensionData: null,
      Message: '',
      Success: true,
      Pagination: null,
    },
  },
  {
    url: '/api/Member/RankInfo',
    timeout: _.random(20, 1000),
    method: 'post',
    response: [
      {
        GameType: 'EGame',
        RankData: {
          RankTable: _.times(_.random(1, 6), () => ({ Account: randomText() })),
          MyRank: null,
        },
      },
    ],
  },
  {
    url: '/api/Game/MoreGame',
    method: 'post',
    timeout: _.random(20, 1000),
    response: {
      Code: 0,
      Data: _.times(60, () => getGame()),
      ExtensionData: null,
      Message: '',
      Success: true,
      Pagination: null,
    },
  },
  {
    url: '/api/Game/SearchGame',
    method: 'post',
    timeout: _.random(20, 1000),
    response: {
      Code: 0,
      Data: _.times(60, () => getGame()),
      ExtensionData: null,
      Message: '',
      Success: true,
      Pagination: null,
    },
  },
]

export default list
