export interface CursorItem {
  key: string
  value: string
}

export function parseCursor(encoded: string): any {
  const filterItems = Buffer.from(encoded).toString('ascii').split(',')

  return filterItems.reduce((obj: any, item: string) => {
    const [key, value] = item.split(':')
    obj[key] = value
    return obj
  }, {})
}

export function encodeCursor(cursors: CursorItem[]): string {
  const str = cursors.map(({ key, value }) => `${key}:${value}`).join(',')
  return Buffer.from(str).toString('base64')
}
