import { parse } from 'node-html-parser';
import path from 'node:path'
import url from 'node:url'
import fs from 'node:fs'
import os from 'node:os'
import _ from 'lodash'

/**
 * @type {{path:string,auth?:boolean,mainten?:boolean,limit?:boolean,nginxPath?:string}[]}
 */
const routesToPrerender = [
  { path: '/' },
  { path: '/favorite' },
  { path: '/history' },
  { path: '/egame' },
  { path: '/live' },
  { path: '/lottery' },
  { path: '/hot' },
  { path: '/recommend' },
  { path: '/new' },
  { path: '/account' },
  { path: '/playing' },
  { path: '/503', mainten: true },
  { path: '/403', limit: true },
]

const addRouteToNginx = os.userInfo().username === 'runner' || fs.existsSync('/.dockerenv')
const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const resolvePath = p => path.resolve(__dirname, p)
const nginxRoute = (fileName, routePath, nginxPath) =>
  `location ${nginxPath || '= ' + routePath} {try_files $uri /${fileName}.html;}\n`

const nginxConfPath = resolvePath('../nginx.conf')
let conf = fs.readFileSync(nginxConfPath, 'utf-8')
const manifest = JSON.parse(fs.readFileSync(resolvePath('../dist/.vite/ssr-manifest.json'), 'utf-8'))
const template = fs.readFileSync(resolvePath('../dist/index.html'), 'utf-8')
const { render } = await import('../dist/SSG/main.js')

function output(index = 0) {
  const item = routesToPrerender[index]
  const routePath = item?.path
  if (!routePath) return
  return render(routePath, manifest, _.omit(item, ['path'])).then(([appHtml, preloadLinks]) => {
    const htmlRoot = parse(template)
    const headNode = htmlRoot.querySelector('head')
    const appRootNode = htmlRoot.querySelector('#root')
    if (!appRootNode|| !headNode) return
    headNode.innerHTML += preloadLinks
    appRootNode.innerHTML += appHtml

    const fileName = routePath.split('/').reverse()[0] || 'home'
    const filePath = `../dist/${fileName}.html`
    conf = conf.replace(/}$/, `${nginxRoute(fileName, routePath, item?.nginxPath)}}`)

    fs.writeFileSync(resolvePath(filePath), htmlRoot.innerHTML)
    return output(index + 1)
  })
}

await output()
fs.writeFileSync(addRouteToNginx ? nginxConfPath : resolvePath('../dist/nginx.conf'), conf)
fs.rmSync(resolvePath('../dist/.vite'), { recursive: true, force: true })
fs.rmSync(resolvePath('../dist/SSG'), { recursive: true, force: true })
