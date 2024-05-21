export default function copy(text: string) {
  try {
    navigator.clipboard.writeText(text).then(
      () => {
        /* success */
      },
      () => {
        /* failure */
        deprecatedCopy(text)
      },
    )
  } catch (error) {
    deprecatedCopy(text)
  }
}

function deprecatedCopy(text: string) {
  const input = document.createElement('input')
  input.style.position = 'absolute'
  input.style.opacity = '0'
  input.value = text
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy')
  input.remove()
}
