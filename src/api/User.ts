import request, { type RespBodyWrapper } from '@/utils/request'
import type { Game } from './Game'

export function Validate(data: { AuthToken: string | null }) {
  return request<RespBodyWrapper<RespValidate>>({
    url: '/api/User/Validate',
    method: 'post',
    data,
    absolute: true,
  })
}

export function RefreshToken() {
  return request<RespBodyWrapper<RespRefreshToken>>({
    url: '/api/User/RefreshToken',
    method: 'post',
    absolute: true,
  })
}

interface RespRefreshToken {
  UserData: {
    Balance: number
  }
  UserToken: string
}
interface RespValidate {
  UserToken: string
  RespData: {
    Avatar: string
    Balance: number
    Banner: { Pic: string; ID: number; Type: number }[]
    Currency: string
    GameFavorite: Game[]
    GameGuessLike: Game[]
    GameHot: Game[]
    GameNew: Game[]
    GameRecent: Game[]
    GameKindList: {
      Key: string
      Value: number
    }[]
    Language: string
    Notify: boolean
  }
}
