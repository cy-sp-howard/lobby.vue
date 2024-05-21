import type { IncomingMessage, IncomingHttpHeaders } from 'node:http'
import { pathToFileURL, type UrlObject } from 'node:url'
import type { PluginOption } from 'vite'
import CryptoJS from 'crypto-js'
import { build } from 'esbuild'
import chokidar from 'chokidar'
import path from 'node:path'
import fs from 'node:fs'
import _ from 'lodash'

export interface mockConfig {
  url: string
  method?: 'get' | 'post' | 'put' | 'delete' | 'patch'
  timeout?: number
  status?: number
  response:
  | ((req: {
    body: unknown
    query: UrlObject['query']
    headers: IncomingHttpHeaders
    config: Pick<mockConfig, 'timeout' | 'status'>
  }) => unknown)
  | unknown
}

const folderPath = __dirname

const loadedMockConfig: Map<string, mockConfig[]> = new Map()

function loadMockApi() {
  _.chain(fs.readdirSync(folderPath))
    .filter(i => !['index.ts'].includes(i) && path.extname(i).toLowerCase() === '.ts')
    .each(i => {
      const outfile = `${i}-${Date.now()}.mjs`
      return build({
        absWorkingDir: folderPath,
        entryPoints: [path.resolve(folderPath, i)],
        format: 'esm',
        sourcemap: 'inline',
        platform: 'node',
        outfile,
        write: false,
      })
        .then(({ outputFiles }) => {
          const { text, path: filePath } = outputFiles[0]
          fs.writeFileSync(filePath, text)
          return import(pathToFileURL(filePath).toString()).then(({ default: config }) => {
            try {
              fs.unlinkSync(filePath)
            } catch (error) {
              console.log(error)
            }
            return [outfile, config]
          })
        })
        .then(i => {
          loadedMockConfig.clear()
          loadedMockConfig.set(i[0], i[1])
        })
        .catch(e => {
          console.log(e.message)
        })
    })
    .value()
}

function parseJson(req: IncomingMessage): Promise<unknown> {
  let rawData = ''
  return new Promise(rs => {
    req.on('data', chunk => {
      rawData += chunk
    })
    req.on('end', () => {
      try {
        rs(JSON.parse(rawData))
      } catch (e) {
        rs(rawData)
      }
    })
  })
}

export default function (): PluginOption {
  return {
    name: 'mock',
    configureServer(server) {
      chokidar.watch(folderPath).on('ready', () => {
        loadMockApi()
      })

      chokidar.watch(folderPath).on('change', () => {
        loadMockApi()
      })

      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/dev/restart') {
          res.end('ok')
          server.restart()
          return
        } else if (req.url === '/dev/login') {
          getToken().then(({ Code, Data }) => {
            if (Code) return Promise.reject()
            const loginURL = new URL(Data.GameUrl)
            res.writeHead(302, {
              'Location': loginURL.search
            });
            res.end();
          }).catch(() => {
            res.end('fail')
          })

          return
        }else if (req.url === '/dev/register') {
          getToken('CreateAccount').then((resp) => {
            res.end(JSON.stringify(resp));
          }).catch(() => {
            res.end('fail')
          })

          return
        }
        const mockList = _.flattenDeep(Array.from(loadedMockConfig, ([key, value]) => value || key))
        const url = new URL(`http://${req.headers.host}${req.url}`)
        const query = Object.fromEntries(url.searchParams.entries())
        const foundReq = _.find(mockList, i => {
          return (
            url.pathname.match(new RegExp(i.url)) &&
            req.method === (i.method ? i.method : 'get').toUpperCase()
          )
        }) as mockConfig | undefined

        if (foundReq) {
          const pickConfig = _.pick(foundReq, ['status', 'timeout']) as Pick<
            mockConfig,
            'status' | 'timeout'
          >
          const mockRes = _.isFunction(foundReq.response)
            ? foundReq.response({
              body: await parseJson(req),
              query,
              headers: req.headers,
              config: pickConfig,
            })
            : foundReq.response

          res.setHeader('Content-Type', 'application/json')
          res.statusCode = pickConfig.status || 200
          setTimeout(() => {
            res.end(JSON.stringify(mockRes))
          }, pickConfig.timeout || 0)
          return
        }
        next()
      })
    },
  }
}

function getToken(action='GameLogin') {
  const secret = 'SxCBK5xpuGci5NjovR4xM23N9d84xHRZI4u0kOofT79tR2gurt'
  const postData = {
    ApiKey: 'speedtest02',
    Game: 'BitGaming',
    MemberAccount: 'rfv743',
    MemberPassword: 'H123456',
  }

  const target = new URL(`http://api-beta.bit-api.com/api/GEZ/${action}`)
  const req: RequestInit & { headers: Headers } = { headers: new Headers() }
  const now = parseInt(String(Date.now() / 1000))
  let ip = '138.199.60.183'
  if(action === 'CreateAccount') ip = ''
  req.headers.append('Content-Type', ' application/json')
  req.body = JSON.stringify({
    ...postData,
    UserIP: ip,
    Timestamp: now,
    Hash: CryptoJS.MD5(`${postData.ApiKey}${postData.Game}${postData.MemberAccount}${ip}${secret}${now}`).toString().toLowerCase()
  })

  req.method = 'POST'
  return fetch(target, req).then((resp) => {
    return resp.json() as Promise<{
      IsSuccess: boolean,
      Code: number,
      Message: string,
      Data: {
        IsReturnHTMLCode: boolean,
        GameUrl: string
        GameLaunchHTML: null | string
      }
    }>
  })


}