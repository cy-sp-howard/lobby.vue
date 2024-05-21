import request, { type RespBodyWrapper } from '@/utils/request'

export function SetFav(data: ReqSetFav) {
  return request<RespBodyWrapper<number>>({
    url: '/api/Member/ModifyFavoriteGame',
    method: 'post',
    data,
  })
}

export function GetRankInfo(data: { GameType: number }) {
  return request<RespGetRankInfo[]>({
    url: '/api/Member/RankInfo',
    method: 'post',
    data,
  })
}

interface RespGetRankInfo {
  GameType: string
  RankData: {
    RankTable: {
      Rank: number
      Account: string
      BetCount: number
      WinCount: number
      IsContinuousRank: boolean
    }[]
    MyRank: null | number
  }
}

interface ReqSetFav {
  Type: number
  GameCode: string
}
