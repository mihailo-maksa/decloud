export const MESSAGE: string = `
Welcome to DeCloud! 

Please sign this message to start uploading files to the IPFS.
`

export const formatCid = (cid: string): string => {
  return `${cid.substr(0, 6).toString()}...${cid
    .substr(cid.length - 6, cid.length)
    .toString()}`
}

export const formatDate = (
  date: number | string,
  type: 'date' | 'datetime',
): string | undefined => {
  if (type === 'datetime') {
    return new Date(date).toLocaleString()
  } else if (type === 'date') {
    return new Date(date).toLocaleDateString()
  }
}

export const formatFileSize = (size: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  let i = 0
  while (size >= 1024) {
    size /= 1024
    i++
  }
  return `${size.toFixed(2)} ${units[i]}`
}

export const copyToClipboard = (
  e: React.MouseEvent<HTMLElement, MouseEvent>,
  cid: string,
  msg: string,
): void => {
  e.preventDefault()

  const el = document.createElement('textarea')
  el.value = cid
  el.setAttribute('readonly', '')

  document.body.appendChild(el)

  el.select()

  document.execCommand('copy')
  document.body.removeChild(el)

  alert(msg)
}
