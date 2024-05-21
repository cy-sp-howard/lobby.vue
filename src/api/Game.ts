import request, { type Pagination, type RespBodyWrapper } from '@/utils/request'

export function Login(data: ReqLogin) {
  return request<RespBodyWrapper<RespLogin>>({
    url: '/api/Game/Login',
    method: 'post',
    data,
  })
}

export function SearchGame(data: ReqSearchGame) {
  return request<RespBodyWrapper<Game[]>>({
    url: '/api/Game/SearchGame',
    method: 'post',
    data,
  })
}

export function GetMoreGame(data: ReqSearchGame) {
  return request<RespBodyWrapper<Game[]>>({
    url: '/api/Game/MoreGame',
    method: 'post',
    data,
  })
}

export interface Game {
  GameCode: string
  GameType: GameType
  GameKind: FastGameKindCode
  GameChineseName: string
  GameEnglishName: string
  PlatformChineseName: string
  PlatformEnglishName: string
  IsFavorite: boolean
  Platform: string
  Count: number
}
interface ReqSearchGame {
  GameName: string
  Language: string
  GameType: GameType
  GameKind: FastGameKindCode
  Page: Pagination
}

interface ReqLogin {
  GameCode: string
  Language: string
}

interface RespLogin {
  IsReturnHTMLCode: boolean
  GameUrl: string
  GameLaunchHTML: string | null
}

export enum FastGameKindCode {
  //[Description("全部")]
  All = -1,

  //[Description("未分类")]
  None = 0,

  //[Description("街机游戏")]
  EGame_ArcadeGame = 1,

  //[Description("老虎机")]
  EGame_SlotGame = 5,

  //[Description("互动游戏")]
  EGame_InteractiveGames = 8,

  //[Description("桌上游戏")]
  EGame_TableGames = 10,

  //[Description("捕鱼游戏")]
  EGame_FishGame = 13,

  //[Description("百家乐")]
  Live_Baccarat = 21,

  //[Description("轮盘")]
  Live_Roulette = 22,

  //[Description("二十一点")]
  Live_Blackjack = 23,

  //[Description("炸金花")]
  Live_FriedGoldenFlower = 24,

  //[Description("三公")]
  Live_Sangong = 25,

  //[Description("牛牛")]
  Live_NiuNiu = 26,

  //[Description("龙虎")]
  Live_DragonTiger = 27,

  //[Description("骰宝")]
  Live_SicBo = 28,

  //賓果
  EGame_Bingo = 29,
}

export enum GameType {
  /// <summary>
  /// 全部
  /// </summary>
  All = -1,
  /// <summary>
  /// 未分类
  /// </summary>
  None = 0,
  /// <summary>
  /// 体育
  /// </summary>
  Sports = 1 << 0,
  /// <summary>
  /// 电竞
  /// </summary>
  ESports = 1 << 1,
  /// <summary>
  /// 真人娱乐
  /// </summary>
  Live = 1 << 2,
  /// <summary>
  /// 电子老虎机
  /// </summary>
  Slot = 1 << 3,
  /// <summary>
  /// 彩票
  /// </summary>
  Lottery = 1 << 4,
  /// <summary>
  /// 棋牌
  /// </summary>
  Chess = 1 << 6,
}
