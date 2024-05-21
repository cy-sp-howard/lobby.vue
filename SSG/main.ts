import { basename } from 'node:path'
import { createApp } from '../src/main'
import router from '../src/router/index'
import { useWebStore } from '../src/stores/web'
import { useUserStore } from '../src/stores/user'
import { renderToString, type SSRContext } from 'vue/server-renderer'

const app = createApp()

export async function render(
  url: string,
  manifest: Record<string, string[]>,
  opts?: { auth?: boolean,limit?:boolean,mainten?:boolean },
) {
  const webStore = useWebStore()
  const userStore = useUserStore()
  userStore.token = opts?.auth ? ['token','token'] : [null,'']
  webStore.isLimit = Boolean(opts?.limit)
  webStore.isMaintenance = Boolean(opts?.mainten)
  userStore.CellPhoneStatus = 1
  userStore.EmailStatus = 1
  await router.push(url)
  await router.isReady()

  const ctx: SSRContext = {}
  const html = await renderToString(app, ctx)

  const preloadLinks = renderPreloadLinks(ctx.modules, manifest)
  return [html, preloadLinks]
}

function renderPreloadLinks(modules: Set<string>, manifest: Record<string, string[]>) {
  let links = ''
  const seen = new Set()
  modules.forEach(id => {
    const files = manifest[id]
    if (files) {
      files.forEach(file => {
        if (!seen.has(file)) {
          seen.add(file)
          const filename = basename(file)
          if (manifest[filename]) {
            for (const depFile of manifest[filename]) {
              links += renderPreloadLink(depFile)
              seen.add(depFile)
            }
          }
          links += renderPreloadLink(file)
        }
      })
    }
  })
  return links
}

function renderPreloadLink(file: string) {
  if (file.endsWith('.css')) {
    return `<link rel="stylesheet" href="${file}">`
  } else {
    return ''
  }
}
