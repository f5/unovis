/** `navigator.clipboard` is denied outside a focused secure context, so fall back to a detached selection. */
export async function copyText (text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.setAttribute('readonly', '')
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    const didCopy = document.execCommand('copy')
    document.body.removeChild(textArea)
    return didCopy
  }
}

