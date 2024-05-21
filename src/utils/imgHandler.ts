export function toCanvas(imgSource: HTMLImageElement | string, longestSide = 2000) {
  return new Promise<HTMLCanvasElement>((rs, rj) => {
    setTimeout(() => rj('timeout'), 5000)
    const isImg = imgSource instanceof Image
    const img = isImg ? imgSource : new Image()

    const onload = () => {
      const { naturalWidth, naturalHeight } = img
      const canvas = document.createElement('canvas')
      const maxSideKey = naturalWidth > naturalHeight ? 'width' : 'height'
      if (naturalWidth > longestSide || naturalHeight > longestSide) {
        const isWidthMax = maxSideKey === 'width'
        canvas[maxSideKey] = longestSide
        canvas[isWidthMax ? 'height' : 'width'] =
          (longestSide / (isWidthMax ? naturalWidth : naturalHeight)) *
          (isWidthMax ? naturalHeight : naturalWidth)
      } else {
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
      }

      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
      rs(canvas)
    }
    img.onload = onload
    if (isImg) return onload()
    img.src = imgSource
  })
}

function _compressImg(
  img: HTMLImageElement,
  longestSide: number,
  convertJpg: boolean,
  maxBytes: number,
) {
  return new Promise<Blob>((rs, rj) => {
    toCanvas(img, longestSide).then(canvas => {
      canvas.toBlob(
        b => {
          if (!b) return rj('to blob err')
          const compressRate = maxBytes / b.size
          const maxLong = Math.max(canvas.width, canvas.height)
          longestSide = longestSide > maxLong ? maxLong : longestSide
          if (compressRate >= 1) {
            rs(b)
          } else {
            rs(
              _compressImg(
                img,
                longestSide - ((1 - compressRate) * longestSide * 3) / 5,
                convertJpg,
                maxBytes,
              ),
            )
          }
        },
        convertJpg ? 'image/jpeg' : undefined,
      )
    })
  })
}

export function compressImg(blobUrl: string, maxBytes: number) {
  return fetch(blobUrl)
    .then(r => r.blob())
    .then(b => {
      const convertJpg = !['image/png', 'image/gif', 'image/webp'].includes(b.type)
      return new Promise<Blob>((rs, rj) => {
        const img = new Image()
        img.src = blobUrl
        img.onload = () => {
          rs(_compressImg(img, 10000, convertJpg, maxBytes))
        }
        setTimeout(() => rj('timeout'), 5000)
      })
    })
}
