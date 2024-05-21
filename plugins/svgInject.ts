import { parse ,HTMLElement} from 'node-html-parser';
import {optimize} from 'svgo'
import type { Plugin } from 'vite'
import path from 'node:path'
import fs from 'node:fs'

export default function (): Plugin {
  const svgFolder = path.resolve(__dirname,'..','src','assets','svg')
  const children = fs.readdirSync(svgFolder).filter(i=>i.match(/\.svg$/i)).map(fileName => {
    const filePath = path.resolve(svgFolder, fileName)
    const svgStr = fs.readFileSync(filePath).toString()
    const svg_el =  parse(optimize(svgStr).data).querySelector('*')
    if(!svg_el) return 
    svg_el.tagName = 'symbol'
    svg_el.setAttribute('id',`icon-${fileName.replace(/.svg$/i, '')}`)
    return svg_el
  })

  return {
    name: 'svg-inject',
    transformIndexHtml(html) {
      if (!children.length) return
      const htmlRoot = parse(html)
      const htmlHead= htmlRoot.querySelector('head')
      const htmlBody= htmlRoot.querySelector('body')
      if(!htmlHead || !htmlBody) return html

      const svgStyle = new HTMLElement('style',{})
      svgStyle.setAttribute('type', 'text/css')
      svgStyle.innerHTML = '#__svg-icons{display:none;}'
      htmlHead.appendChild(svgStyle)

      const svgRoot = new HTMLElement('svg',{id:'__svg-icons'})
      svgRoot.setAttribute('xmlns','http://www.w3.org/2000/svg')
      svgRoot.setAttribute('xmlns:xlink','http://www.w3.org/1999/xlink')
      children.forEach((i)=>{
        if(!i) return
        svgRoot.appendChild(i)
      })
      htmlBody.appendChild(svgRoot)

      return htmlRoot.innerHTML
    },
  }
}
