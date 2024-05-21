import request, { type RespBodyWrapper } from '@/utils/request'
import type { Game } from './Game'

export function GetEGamePage() {
  return request<RespBodyWrapper<RespGetPage>>({
    url: '/api/Page/EGamePage',
    method: 'post',
  })
}

export function GetLivePage() {
  return request<RespBodyWrapper<RespGetPage>>({
    url: '/api/Page/LivePage',
    method: 'post',
  })
}

export function GetLotteryPage() {
  return request<RespBodyWrapper<RespGetPage>>({
    url: '/api/Page/LotteryPage',
    method: 'post',
  })
}

export function GetFavoritePage() {
  return request<RespBodyWrapper<RespFavoritePage>>({
    url: '/api/Page/FavoritePage',
    method: 'post',
  })
}

export function GetRecentPlayPage() {
  return request<RespBodyWrapper<{ GameAll: Game[] }>>({
    url: '/api/Page/RecentPlayPage',
    method: 'post',
  })
}

export function GetNewGamePage() {
  return request<RespBodyWrapper<RespGetRecommendPage>>({
    url: '/api/Page/NewGamePage',
    method: 'post',
  })
}

export function GetRecommendPage() {
  return request<RespBodyWrapper<RespGetRecommendPage>>({
    url: '/api/Page/RecommendPage',
    method: 'post',
  })
}

export function GetHotGamePage() {
  return request<RespBodyWrapper<RespHotGamePage>>({
    url: '/api/Page/HotGamePage',
    method: 'post',
  })
}

type RespFavoritePage = Record<string, Game[]>
interface RespGetPage {
  GameGuessLike: Game[]
  GameFavorite: Game[]
  GameRecent: Game[]
  GameHot: Game[]
  GameKindList: {
    Key: string
    Value: number
  }[]
  GameAll: Game[]
}
type RespHotGamePage = RespFavoritePage & { GameGuessLike: Game[] }
type RespGetRecommendPage = Pick<RespGetPage, 'GameKindList' | 'GameAll' | 'GameGuessLike'>
